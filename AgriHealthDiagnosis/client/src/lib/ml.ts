import * as tf from '@tensorflow/tfjs';

export async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function loadModel() {
  try {
    const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
    return model;
  } catch (err) {
    console.error('Error loading model:', err);
    throw new Error('Failed to load ML model');
  }
}
