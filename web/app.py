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
    
    # Format best solution composition
    composition = []
    total_weight = 0
    for i, feed in enumerate(feeds):
        amount = result['best_chrom'][i]
        total_weight += amount
        composition.append({
            "name": feed['name'],
            "amount": round(amount, 4),
            "price": feed['price'],
            "cost": round(amount * feed['price'], 2),
            "prdd_contribution": round(amount * feed['prdd'], 4),
            "mp_contribution": round(amount * feed['mp'], 4)
        })
    
    # Add percentage contribution
    for item in composition:
        item['weight_percentage'] = round((item['amount'] / total_weight * 100) if total_weight > 0 else 0, 2)
        item['cost_percentage'] = round((item['cost'] / result['totals']['cost'] * 100) if result['totals']['cost'] > 0 else 0, 2)
    
    # Format top 5 solutions
    top_solutions_formatted = []
    for sol in result['top_solutions']:
        sol_composition = []
        for i, feed in enumerate(feeds):
            amount = sol['chromosome'][i]
            sol_composition.append({
                "name": feed['name'],
                "amount": round(amount, 4),
                "cost": round(amount * feed['price'], 2)
            })
        
        top_solutions_formatted.append({
            "rank": sol['rank'],
            "composition": sol_composition,
            "totals": {
                "prdd": round(sol['totals']['prdd'], 4),
                "mp": round(sol['totals']['mp'], 4),
                "cost": round(sol['totals']['cost'], 2)
            },
            "fitness": round(sol['fitness'], 6)
        })
    
    # Format history data
    history_formatted = []
    for h in result['history']:
        history_formatted.append({
            "generation": h['generation'],
            "best_fitness": round(h['best_fitness'], 6),
            "avg_fitness": round(h['avg_fitness'], 6),
            "best_cost": round(h['best_cost'], 2)
        })
    
    response = {
        "composition": composition,
        "totals": {
            "prdd": round(result['totals']['prdd'], 4),
            "mp": round(result['totals']['mp'], 4),
            "cost": round(result['totals']['cost'], 2),
            "weight": round(total_weight, 4)
        },
        "fitness": round(result['best_fit'], 6),
        "history": history_formatted,
        "top_solutions": top_solutions_formatted,
        "requirements": {
            "prdd": required_prdd,
            "mp": required_mp
        }
    }
    
    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True)
