# -*- coding: utf-8 -*-
"""
Flask Web Application untuk Algoritma Genetika Optimasi Pakan Sapi Perah
"""

from flask import Flask, render_template, jsonify, Response, stream_with_context, request
import json
import time
import threading
from genetic_algorithm import genetic_algorithm, format_result
from config import MAX_GEN, get_default_config

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
app.config['JSON_SORT_KEYS'] = False

# Global variable untuk menyimpan progress
progress_data = {
    "current_gen": 0,
    "total_gen": MAX_GEN,
    "best_fitness": 0,
    "history": []
}


@app.route('/')
def index():
    """Halaman utama"""
    from flask import make_response
    response = make_response(render_template('index.html'))
    response.headers['Content-Type'] = 'text/html; charset=utf-8'
    return response


@app.route('/api/config', methods=['GET'])
def get_config():
    """
    Endpoint untuk mendapatkan konfigurasi default
    """
    return jsonify(get_default_config())


@app.route('/api/run', methods=['POST'])
def run_algorithm():
    """
    Endpoint untuk menjalankan algoritma genetika
    Menerima custom parameters dari request body
    Returns hasil akhir optimasi
    """
    global progress_data
    
    # Get custom parameters from request
    data = request.get_json() or {}
    
    # Extract parameters (use None if not provided, will use defaults in GA)
    custom_feeds = data.get('feeds')
    custom_prdd = data.get('required_prdd')
    custom_mp = data.get('required_mp')
    custom_pop_size = data.get('pop_size')
    custom_max_gen = data.get('max_gen')
    custom_crossover = data.get('crossover_rate')
    custom_mutation = data.get('mutation_rate')
    
    # Update progress_data total_gen
    progress_data["total_gen"] = custom_max_gen if custom_max_gen else MAX_GEN
    
    # Reset progress data
    progress_data = {
        "current_gen": 0,
        "total_gen": custom_max_gen if custom_max_gen else MAX_GEN,
        "best_fitness": 0,
        "history": [],
        "running": True,
        "result": None
    }
    
    def progress_callback(gen, best_chrom, best_fit, totals):
        """Callback untuk update progress"""
        progress_data["current_gen"] = gen
        progress_data["best_fitness"] = best_fit
        progress_data["history"].append({
            "gen": gen,
            "fitness": best_fit,
            "prdd": totals["prdd"],
            "mp": totals["mp"],
            "cost": totals["cost"]
        })
        # Small delay to allow SSE updates
        time.sleep(0.01)
    
    
    def run_ga():
        """Run GA in background thread"""
        try:
            best_chrom, totals, best_fit, detailed_history = genetic_algorithm(
                progress_callback=progress_callback,
                feeds=custom_feeds,
                required_prdd=custom_prdd,
                required_mp=custom_mp,
                pop_size=custom_pop_size,
                max_gen=custom_max_gen,
                crossover_rate=custom_crossover,
                mutation_rate=custom_mutation
            )
            result = format_result(best_chrom, totals, best_fit, custom_feeds)
            result["history"] = progress_data["history"]
            result["detailed_history"] = detailed_history
            result["parameters"] = {
                "pop_size": custom_pop_size if custom_pop_size else 100,
                "max_gen": custom_max_gen if custom_max_gen else 200,
                "crossover_rate": custom_crossover if custom_crossover else 0.3,
                "mutation_rate": custom_mutation if custom_mutation else 0.3
            }
            progress_data["result"] = result
            progress_data["running"] = False
        except Exception as e:
            print(f"GA Error: {e}")
            progress_data["error"] = str(e)
            progress_data["running"] = False
    
    # Run in background thread
    thread = threading.Thread(target=run_ga)
    thread.daemon = True
    thread.start()
    return jsonify({"status": "started"})


@app.route('/api/progress')
def stream_progress():
    """
    Server-Sent Events endpoint untuk streaming progress
    """
    def generate():
        last_gen = -1
        while True:
            current_gen = progress_data["current_gen"]
            
            # Kirim update jika ada generasi baru
            if current_gen != last_gen:
                data = {
                    "current_gen": current_gen,
                    "total_gen": progress_data["total_gen"],
                    "best_fitness": progress_data["best_fitness"],
                    "progress_percent": (current_gen / progress_data["total_gen"]) * 100
                }
                
                yield f"data: {json.dumps(data)}\n\n"
                last_gen = current_gen
                
                # Selesai jika sudah mencapai generasi terakhir
                if current_gen >= progress_data["total_gen"] - 1:
                    time.sleep(0.5)
                    break
            
            if not progress_data.get("running", True):
                break
            
            time.sleep(0.1)  # Polling interval
    
    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no'
        }
    )


@app.route('/api/result')
def get_result():
    """Get algorithm result after completion"""
    if progress_data.get("result"):
        return jsonify(progress_data["result"])
    elif progress_data.get("error"):
        return jsonify({"error": progress_data["error"]}), 500
    elif progress_data.get("running", False):
        return jsonify({"status": "running"}), 202
    else:
        return jsonify({"error": "No result available"}), 404





if __name__ == '__main__':
    print("="*60)
    print("Flask Web Application - Algoritma Genetika Optimasi Pakan Sapi")
    print("="*60)
    print("\nAplikasi berjalan di: http://localhost:5000")
    print("Tekan CTRL+C untuk menghentikan server\n")
    
    app.run(debug=True, threaded=True, host='0.0.0.0', port=5000)
