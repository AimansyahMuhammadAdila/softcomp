import random
from typing import List, Dict, Tuple

class GeneticOptimizer:
    def __init__(self, feeds, required_prdd, required_mp, pop_size=100, max_gen=200, crossover_rate=0.3, mutation_rate=0.3, gen_min=0.0, gen_max=10.0):
        self.feeds = feeds
        self.required_prdd = required_prdd
        self.required_mp = required_mp
        self.pop_size = pop_size
        self.max_gen = max_gen
        self.crossover_rate = crossover_rate
        self.mutation_rate = mutation_rate
        self.gen_min = gen_min
        self.gen_max = gen_max
        self.nutrition_penalty_coeff = 1e6

    def decode_chromosome(self, chrom: List[float]) -> Dict[str, float]:
        total_prdd = 0.0
        total_mp = 0.0
        total_cost = 0.0

        for gene, feed in zip(chrom, self.feeds):
            total_prdd += gene * feed["prdd"]
            total_mp += gene * feed["mp"]
            total_cost += gene * feed["price"]

        return {
            "prdd": total_prdd,
            "mp": total_mp,
            "cost": total_cost,
        }

    def objective_function(self, chrom: List[float]) -> float:
        totals = self.decode_chromosome(chrom)
        total_prdd = totals["prdd"]
        total_mp = totals["mp"]
        total_cost = totals["cost"]

        deficit_prdd = max(0.0, self.required_prdd - total_prdd)
        deficit_mp = max(0.0, self.required_mp - total_mp)
        nutrition_deficit = deficit_prdd + deficit_mp

        if nutrition_deficit > 0:
            return total_cost + self.nutrition_penalty_coeff * nutrition_deficit
        else:
            return total_cost

    def fitness(self, chrom: List[float]) -> float:
        obj = self.objective_function(chrom)
        return 1.0 / (1.0 + obj)

    def random_gene(self) -> float:
        return random.uniform(self.gen_min, self.gen_max)

    def random_chromosome(self) -> List[float]:
        return [self.random_gene() for _ in range(len(self.feeds))]

    def initialize_population(self) -> List[List[float]]:
        return [self.random_chromosome() for _ in range(self.pop_size)]

    def extended_intermediate_crossover(self, p1: List[float], p2: List[float]) -> Tuple[List[float], List[float]]:
        alpha = random.uniform(0, 1)

        c1 = []
        c2 = []
        for g1, g2 in zip(p1, p2):
            new_g1 = g1 + alpha * (g2 - g1)
            new_g2 = g2 + alpha * (g1 - g2)

            new_g1 = max(self.gen_min, min(self.gen_max, new_g1))
            new_g2 = max(self.gen_min, min(self.gen_max, new_g2))

            c1.append(new_g1)
            c2.append(new_g2)

        return c1, c2

    def mutate(self, chrom: List[float]) -> List[float]:
        mutant = chrom[:]
        for i in range(len(mutant)):
            if random.random() < self.mutation_rate:
                r = random.uniform(-0.1, 0.1)
                mutant[i] = mutant[i] + r * (self.gen_max - self.gen_min)
                mutant[i] = max(self.gen_min, min(self.gen_max, mutant[i]))
        return mutant

    def run(self):
        population = self.initialize_population()
        best_chrom = None
        best_fit = float("-inf")
        history = []
        
        # Track top solutions
        top_solutions = []  # Will store (chrom, fitness, totals, cost)

        for gen in range(self.max_gen):
            fits = [self.fitness(ind) for ind in population]
            costs = [self.objective_function(ind) for ind in population]
            
            gen_best_idx = max(range(len(population)), key=lambda i: fits[i])
            gen_best_chrom = population[gen_best_idx]
            gen_best_fit = fits[gen_best_idx]
            gen_best_cost = costs[gen_best_idx]

            if gen_best_fit > best_fit:
                best_fit = gen_best_fit
                best_chrom = gen_best_chrom[:]

            # Record generation history
            avg_fit = sum(fits) / len(fits)
            history.append({
                "generation": gen + 1,
                "best_fitness": gen_best_fit,
                "avg_fitness": avg_fit,
                "best_cost": gen_best_cost
            })

            offspring = []

            num_offspring_cross = int(self.crossover_rate * self.pop_size)
            if num_offspring_cross % 2 == 1:
                num_offspring_cross += 1

            for _ in range(num_offspring_cross // 2):
                p1 = random.choice(population)
                p2 = random.choice(population)
                c1, c2 = self.extended_intermediate_crossover(p1, p2)
                offspring.append(c1)
                offspring.append(c2)

            num_offspring_mut = int(self.mutation_rate * self.pop_size)
            for _ in range(num_offspring_mut):
                parent = random.choice(population)
                child = self.mutate(parent)
                offspring.append(child)

            combined = population + offspring
            combined_fits = [(ind, self.fitness(ind)) for ind in combined]
            combined_fits.sort(key=lambda x: x[1], reverse=True)

            population = [ind for (ind, fit_val) in combined_fits[:self.pop_size]]

        # Get top 5 unique solutions from final population
        final_population_with_fitness = [
            (ind, self.fitness(ind), self.decode_chromosome(ind), self.objective_function(ind))
            for ind in population
        ]
        final_population_with_fitness.sort(key=lambda x: x[1], reverse=True)
        
        # Take top 5 solutions
        top_solutions = []
        for i in range(min(5, len(final_population_with_fitness))):
            chrom, fit, totals, cost = final_population_with_fitness[i]
            top_solutions.append({
                "rank": i + 1,
                "chromosome": chrom,
                "fitness": fit,
                "totals": totals,
                "cost": cost
            })

        best_totals = self.decode_chromosome(best_chrom)
        return {
            "best_chrom": best_chrom,
            "totals": best_totals,
            "best_fit": best_fit,
            "history": history,
            "top_solutions": top_solutions
        }
