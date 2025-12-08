# Script to patch app.py for threading support
import re

# Read current app.py
with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add threading import if not exists
if 'import threading' not in content:
    content = content.replace('import time', 'import time\nimport threading')

# Find and replace the synchronous GA call with threaded version
pattern = r'''    # Jalankan algoritma dengan custom parameters
    best_chrom, totals, best_fit, detailed_history = genetic_algorithm\(
        progress_callback=progress_callback,
        feeds=custom_feeds,
        required_prdd=custom_prdd,
        required_mp=custom_mp,
        pop_size=custom_pop_size,
        max_gen=custom_max_gen,
        crossover_rate=custom_crossover,
        mutation_rate=custom_mutation
    \)
    
    # Format hasil
    result = format_result\(best_chrom, totals, best_fit, custom_feeds\)
    result\["history"\] = progress_data\["history"\]
    result\["detailed_history"\] = detailed_history
    result\["parameters"\] = \{
        "pop_size": custom_pop_size if custom_pop_size else 100,
        "max_gen": custom_max_gen if custom_max_gen else 200,
        "crossover_rate": custom_crossover if custom_crossover else 0.3,
        "mutation_rate": custom_mutation if custom_mutation else 0.3
    \}
    
    return jsonify\(result\)'''

replacement = '''    def run_ga():
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
    return jsonify({"status": "started"})'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Add /api/result endpoint before if __name__
result_endpoint = '''

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

'''

# Insert before if __name__
if '@app.route(\'/api/result\')' not in content:
    content = content.replace('\n\nif __name__ ==', result_endpoint + '\nif __name__ ==')

# Write patched file
with open('app.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("[SUCCESS] app.py patched with threading support")
print("[SUCCESS] Added /api/result endpoint")
