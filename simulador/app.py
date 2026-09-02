from flask import Flask, jsonify
import random
import requests

app = Flask(__name__)


@app.route('/', methods=['GET'])
def status():
    return jsonify({"status": "success", "message": "API is running!"}), 200


@app.route('/weather', methods=['GET'])
def pelotas_weather_endpoint():
    lat = -31.7719
    lon = -52.3361
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&current=temperature_2m,relative_humidity_2m"
    )

    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        current_data = response.json().get("current", {})
        return jsonify({
            "temperature": str(current_data.get("temperature_2m")),
            "humidity": str(current_data.get("relative_humidity_2m")),
        }), 200
    except requests.exceptions.RequestException:
        return jsonify({"error": "Service temporarily unavailable"}), 503


@app.route('/estufa1', methods=['GET'])
def estufa1_data():
    return jsonify({
        "water_level": random.randint(0, 100),
        "product_level": random.randint(0, 100),
    }), 200


def line_data():
    flow_state = [random.randint(0, 20) for _ in range(8)]
    pump_state = [1 if flow > 0 else 0 for flow in flow_state]
    return jsonify({
        "soil_humidity": random.randint(0, 100),
        "ph": round(random.uniform(5.0, 7.5), 2),
        "conductivity": round(random.uniform(0.8, 3.0), 2),
        "pump_state": pump_state,
        "flow_state": flow_state,
    }), 200


@app.route('/estufa1/linha1', methods=['GET'])
def linha1_data():
    return line_data()


@app.route('/estufa1/linha2', methods=['GET'])
def linha2_data():
    return line_data()


@app.route('/estufa1/linha3', methods=['GET'])
def linha3_data():
    return line_data()


@app.route('/central_node', methods=['GET'])
def central_node_data():
    return jsonify({
        "water_level": random.randint(0, 100),
        "product_level": random.randint(0, 100),
    }), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
