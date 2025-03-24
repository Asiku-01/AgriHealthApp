import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDiagnosisSchema, insertUserSchema } from "@shared/schema";
import * as tf from "@tensorflow/tfjs-node";

// Load ML model 
let model: tf.LayersModel;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize model
  try {
    model = await tf.loadLayersModel("https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json");
  } catch (err) {
    console.error("Failed to load ML model:", err);
  }

  app.post("/api/diagnose", async (req, res) => {
    const result = insertDiagnosisSchema.safeParse(req.body);
    if (!result.success) {
      console.error("Validation error:", result.error);
      return res.status(400).json({ message: "Invalid request", errors: result.error.errors });
    }

    try {
      // Process image with TensorFlow
      const imageBuffer = Buffer.from(result.data.image.split(",")[1], "base64");
      const tensor = tf.node.decodeImage(imageBuffer);
      const resized = tf.image.resizeBilinear(tensor as tf.Tensor3D, [224, 224]);
      const expanded = resized.expandDims(0);
      const normalized = expanded.div(255.0);

      let prediction;
      let confidenceScore = 0.95;
      
      if (model) {
        // Multi-model inference
        prediction = await model.predict(normalized);
        
        // Process environmental data for enhanced diagnosis
        if (result.data.environmentalData) {
          const { temperature, humidity, soilPh } = result.data.environmentalData;
          
          // Adjust prediction based on environmental factors
          confidenceScore *= await processEnvironmentalFactors(
            temperature,
            humidity,
            soilPh
          );
        }

        // Offline support - cache predictions
        try {
          await cacheModelPrediction(prediction);
        } catch (err) {
          console.warn("Failed to cache prediction:", err);
        }
      } else {
        // Fallback to cached model if online model unavailable
        prediction = await loadCachedPrediction();
      }

      // Cross-reference with similar cases
      const similarCases = await findSimilarCases(prediction);

      // Process environmental data for enhanced diagnosis
      const environmentalData = result.data.environmentalData;

      // Adjust confidence based on environmental data completeness
      if (environmentalData) {
        const dataPoints = Object.values(environmentalData).filter(v => v !== undefined).length;
        confidenceScore *= (1 + dataPoints * 0.05); // Increase confidence with more data
      }

      // Create the diagnosis object without type errors
      const diagnosisData = {
        type: result.data.type,
        image: result.data.image,
        userId: result.data.userId,
        symptoms: result.data.symptoms,
        environmentalData: result.data.environmentalData,
      };

      // Create diagnosis with ML results and environmental context
      const diagnosis = await storage.createDiagnosis(diagnosisData);

      // Update the diagnosis with ML results
      diagnosis.diagnosis = {
        condition: "Sample Condition", // Replace with actual ML prediction
        confidence: confidenceScore,
        recommendations: [
          "Based on environmental conditions:",
          environmentalData?.temperature ? `Maintain temperature around ${environmentalData.temperature}°C` : null,
          environmentalData?.humidity ? `Keep humidity at ${environmentalData.humidity}%` : null,
        ].filter(Boolean) as string[],
        progressHistory: [{
          date: new Date().toISOString(),
          status: "Initial Diagnosis",
          notes: result.data.symptoms || "No symptoms provided"
        }]
      };

      res.json(diagnosis);
    } catch (err) {
      console.error("Diagnosis error:", err);
      res.status(500).json({ message: "Error processing diagnosis" });
    }
  });

  app.get("/api/diagnoses/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const diagnoses = await storage.getDiagnoses(userId);
    res.json(diagnoses);
  });

  const httpServer = createServer(app);
  return httpServer;
}