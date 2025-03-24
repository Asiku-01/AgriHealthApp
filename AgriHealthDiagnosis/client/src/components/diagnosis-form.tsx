import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDiagnosisSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { preprocessImage } from "@/lib/ml";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, ImagePlus, Thermometer, Droplets } from "lucide-react";

export function DiagnosisForm() {
  const [preview, setPreview] = useState<string>();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const [timelapseImages, setTimelapseImages] = useState<string[]>([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [voiceInput, setVoiceInput] = useState(false);
  
  useEffect(() => {
    // Check network status
    setIsOfflineMode(!navigator.onLine);
    window.addEventListener('online', () => setIsOfflineMode(false));
    window.addEventListener('offline', () => setIsOfflineMode(true));
    
    return () => {
      window.removeEventListener('online', () => setIsOfflineMode(false));
      window.removeEventListener('offline', () => setIsOfflineMode(true));
    };
  }, []);

  const form = useForm({
    resolver: zodResolver(insertDiagnosisSchema),
    defaultValues: {
      type: "plant",
      image: "",
      userId: 1,
      symptoms: "",
      environmentalData: {
        temperature: undefined,
        humidity: undefined,
        soilPh: undefined,
        weatherConditions: "",
        location: "",
      },
      timelapseEnabled: false,
      requiresExpertConsultation: false,
      languagePreference: navigator.language,
    },
  });

  const handleVoiceInput = async () => {
    if ('webkitSpeechRecognition' in window) {
      setVoiceInput(true);
      // Implementation for voice recognition
    }
  };

  const mutation = useMutation({
    mutationFn: async (formData: any) => {
      try {
        const response = await apiRequest("POST", "/api/diagnose", formData);
        const json = await response.json();
        return json;
      } catch (error) {
        console.error("Mutation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Diagnosis submitted successfully",
      });
      form.reset();
      setPreview(undefined);
    },
    onError: (error) => {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit diagnosis",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      setIsProcessing(true);
      const base64 = await preprocessImage(file);
      setPreview(base64);
      form.setValue("image", base64);
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = form.handleSubmit(async (data) => {
    if (!preview) {
      toast({
        title: "Error",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const formData = {
        type: data.type,
        image: preview,
        userId: data.userId,
        symptoms: data.symptoms || "",
        environmentalData: {
          temperature: data.environmentalData?.temperature,
          humidity: data.environmentalData?.humidity,
          soilPh: data.environmentalData?.soilPh,
          weatherConditions: data.environmentalData?.weatherConditions,
        },
      };

      await mutation.mutateAsync(formData);
    } catch (err) {
      console.error("Form submission error:", err);
    } finally {
      setIsProcessing(false);
    }
  });

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diagnosis Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="plant" id="plant" />
                      <label htmlFor="plant">Plant</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="livestock" id="livestock" />
                      <label htmlFor="livestock">Livestock</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="symptoms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Symptoms Description</FormLabel>
                <FormDescription>
                  Describe the visible symptoms or concerns you've observed
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="E.g., Yellow leaves, wilting, spots on leaves..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="environmentalData.temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature (°C)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="20"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                      <Thermometer className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="environmentalData.humidity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Humidity (%)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                      <Droplets className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormLabel>Upload Image</FormLabel>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isProcessing ? "bg-muted" : "hover:bg-muted/50"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                id="image-upload"
                disabled={isProcessing}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer flex flex-col items-center gap-2 ${
                  isProcessing ? "cursor-not-allowed" : ""
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-muted-foreground">Processing image...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Click to upload an image
                    </span>
                  </>
                )}
              </label>
            </div>

            {preview && !isProcessing && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isProcessing || mutation.isPending}
          >
            {isProcessing || mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Submit Diagnosis'
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
}