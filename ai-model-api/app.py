from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import numpy as np
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Load your trained model
model = load_model("aurora.h5")
class_names = ['acne', 'acne skin', 'hair follicles', 'keratosis_pilaris', 'rosacea', 'redness']

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files["image"]
    image = Image.open(image).convert("RGB")
    image = image.resize((224, 224))  # Match input size of your model
    image = img_to_array(image)
    image = np.expand_dims(image, axis=0) / 255.0

    predictions = model.predict(image)[0]
    max_index = np.argmax(predictions)
    predicted_class = class_names[max_index]
    confidence = float(predictions[max_index])

    return jsonify({"prediction": predicted_class, "confidence": round(confidence, 2)})

def load_mapping():
    path = os.path.join(os.path.dirname(__file__), "class_mapping.json")
    with open(path, "r") as f:
        return json.load(f)

@app.route("/model-info", methods=["GET"])
def model_info():
    try:
        mapping = load_mapping()
        return jsonify(mapping)
    except Exception as e:
        return jsonify({"error": "Failed to load mapping", "details": str(e)}), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    # Get environment variables
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    app.run(port=port, debug=debug)
