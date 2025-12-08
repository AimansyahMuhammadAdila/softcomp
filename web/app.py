from flask import Flask, render_template, request, jsonify
from ga_logic import GeneticOptimizer

app = Flask(__name__)

# Default Data
DEFAULT_FEEDS = [
    {"name": "Alang-alang", "price": 500, "prdd": 0.04, "mp": 0.45},
    {"name": "Kacang panjang", "price": 2500, "prdd": 0.16, "mp": 0.60},
    {"name": "Ampas tahu", "price": 1500, "prdd": 0.20, "mp": 0.70},
    {"name": "Bungkil kelapa", "price": 3000, "prdd": 0.22, "mp": 0.70}
]

@app.route('/')
def index():
    return render_template('index.html', default_feeds=DEFAULT_FEEDS)

@app.route('/optimize', methods=['POST'])
def optimize():
    data = request.json
    
    feeds = data.get('feeds', DEFAULT_FEEDS)
    required_prdd = float(data.get('required_prdd', 1.036))
    required_mp = float(data.get('required_mp', 7.5))
    
    # GA Parameters
    pop_size = int(data.get('pop_size', 100))
    max_gen = int(data.get('max_gen', 200))
    crossover_rate = float(data.get('crossover_rate', 0.3))
    mutation_rate = float(data.get('mutation_rate', 0.3))
    
    optimizer = GeneticOptimizer(
        feeds=feeds,
        required_prdd=required_prdd,
        required_mp=required_mp,
        pop_size=pop_size,
        max_gen=max_gen,
        crossover_rate=crossover_rate,
        mutation_rate=mutation_rate
    )
    
    result = optimizer.run()
    
    # Format result for frontend
    composition = []
    for i, feed in enumerate(feeds):
        composition.append({
            "name": feed['name'],
            "amount": round(result['best_chrom'][i], 4),
            "price": feed['price'],
            "cost": round(result['best_chrom'][i] * feed['price'], 2)
        })
        
    response = {
        "composition": composition,
        "totals": result['totals'],
        "fitness": result['best_fit']
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
