# -*- coding: utf-8 -*-
"""
Modul Algoritma Genetika untuk Optimasi Pakan Sapi Perah
"""

import random
from typing import List, Dict, Tuple, Callable, Optional
from config import (
    FEEDS, REQUIRED_PRDD, REQUIRED_MP, GEN_MIN, GEN_MAX,
    NUTRITION_PENALTY_COEFF, POP_SIZE, MAX_GEN, CROSSOVER_RATE, MUTATION_RATE
)

Chromosome = List[float]


def decode_chromosome(chrom: Chromosome) -> Dict[str, float]:
    """
    Decode kromosom menjadi total nutrisi dan biaya
    
    Args:
        chrom: Kromosom (list bobot pakan)
    
    Returns:
        Dict berisi total prdd, mp, dan cost
    """
    total_prdd = 0.0
    total_mp = 0.0
    total_cost = 0.0

    for gene, feed in zip(chrom, FEEDS):
        total_prdd += gene * feed["prdd"]
        total_mp += gene * feed["mp"]
        total_cost += gene * feed["price"]

    return {
        "prdd": total_prdd,
        "mp": total_mp,
        "cost": total_cost,
    }


def objective_function(chrom: Chromosome) -> float:
    """
    Fungsi objektif: minimasi biaya dengan constraint nutrisi
    
    Args:
        chrom: Kromosom
    
    Returns:
        Nilai objektif (biaya + penalti)
    """
    totals = decode_chromosome(chrom)
    total_prdd = totals["prdd"]
    total_mp = totals["mp"]
    total_cost = totals["cost"]

    deficit_prdd = max(0.0, REQUIRED_PRDD - total_prdd)
    deficit_mp = max(0.0, REQUIRED_MP - total_mp)
    nutrition_deficit = deficit_prdd + deficit_mp

    if nutrition_deficit > 0:
        return total_cost + NUTRITION_PENALTY_COEFF * nutrition_deficit
    else:
        return total_cost


def fitness(chrom: Chromosome) -> float:
    """
    Fungsi fitness (untuk maksimasi)
    Formula from original notebook: 1 / (1 + objective)
    
    Args:
        chrom: Kromosom
    
    Returns:
        Nilai fitness
    """
    obj = objective_function(chrom)
    return 1.0 / (1.0 + obj)


def random_gene() -> float:
    """Generate gen random dalam range [GEN_MIN, GEN_MAX]"""
    return random.uniform(GEN_MIN, GEN_MAX)


def random_chromosome() -> Chromosome:
    """Generate kromosom random"""
    return [random_gene() for _ in range(len(FEEDS))]


def initialize_population() -> List[Chromosome]:
    """Inisialisasi populasi awal"""
    return [random_chromosome() for _ in range(POP_SIZE)]


def extended_intermediate_crossover(p1: Chromosome, p2: Chromosome) -> Tuple[Chromosome, Chromosome]:
    """
    Extended Intermediate Crossover
    
    Args:
        p1: Parent 1
        p2: Parent 2
    
    Returns:
        Tuple of 2 children
    """
    alpha = random.uniform(0, 1)

    c1 = []
    c2 = []
    for g1, g2 in zip(p1, p2):
        new_g1 = g1 + alpha * (g2 - g1)
        new_g2 = g2 + alpha * (g1 - g2)

        new_g1 = max(GEN_MIN, min(GEN_MAX, new_g1))
        new_g2 = max(GEN_MIN, min(GEN_MAX, new_g2))

        c1.append(new_g1)
        c2.append(new_g2)

    return c1, c2


def mutate(chrom: Chromosome) -> Chromosome:
    """
    Mutasi random
    
    Args:
        chrom: Kromosom
    
    Returns:
        Kromosom yang telah dimutasi
    """
    mutant = chrom[:]
    for i in range(len(mutant)):
        if random.random() < MUTATION_RATE:
            r = random.uniform(-0.1, 0.1)
            mutant[i] = mutant[i] + r * (GEN_MAX - GEN_MIN)
            mutant[i] = max(GEN_MIN, min(GEN_MAX, mutant[i]))
    return mutant


def genetic_algorithm(
    progress_callback: Optional[Callable] = None,
    feeds: Optional[List[Dict]] = None,
    required_prdd: Optional[float] = None,
    required_mp: Optional[float] = None,
    pop_size: Optional[int] = None,
    max_gen: Optional[int] = None,
    crossover_rate: Optional[float] = None,
    mutation_rate: Optional[float] = None
) -> Tuple[Chromosome, Dict, float, List[Dict]]:
    """
    Algoritma Genetika untuk optimasi pakan sapi
    
    Args:
        progress_callback: Optional callback function untuk progress updates
        feeds: Custom feed data (None = use default from config)
        required_prdd: Custom PRDD requirement (None = use default)
        required_mp: Custom MP requirement (None = use default)
        pop_size: Custom population size (None = use default)
        max_gen: Custom max generations (None = use default)
        crossover_rate: Custom crossover rate (None = use default)
        mutation_rate: Custom mutation rate (None = use default)
    
    Returns:
        Tuple of (best_chrom, best_totals, best_fit, detailed_history)
    """
    # Declare global before using FEEDS
    global FEEDS
    original_feeds = FEEDS
    
    # Use custom parameters or defaults
    _feeds = feeds if feeds is not None else original_feeds
    _required_prdd = required_prdd if required_prdd is not None else REQUIRED_PRDD
    _required_mp = required_mp if required_mp is not None else REQUIRED_MP
    _pop_size = pop_size if pop_size is not None else POP_SIZE
    _max_gen = max_gen if max_gen is not None else MAX_GEN
    _crossover_rate = crossover_rate if crossover_rate is not None else CROSSOVER_RATE
    _mutation_rate = mutation_rate if mutation_rate is not None else MUTATION_RATE
    
    # Update global FEEDS for decode functions
    FEEDS = _feeds
    
    population = [random_chromosome() for _ in range(_pop_size)]
    
    best_chrom = None
    best_fit = float("-inf")
    detailed_history = []

    for gen in range(_max_gen):
        # Hitung fitness semua individu
        fits = [fitness(ind) for ind in population]
        gen_best_idx = max(range(len(population)), key=lambda i: fits[i])
        gen_best_chrom = population[gen_best_idx]
        gen_best_fit = fits[gen_best_idx]
        
        # Calculate statistics
        avg_fit = sum(fits) / len(fits)
        worst_fit = min(fits)
        
        # Calculate diversity (standard deviation of genes)
        diversity = 0.0
        if len(population) > 1:
            for gene_idx in range(len(FEEDS)):
                gene_values = [ind[gene_idx] for ind in population]
                mean_val = sum(gene_values) / len(gene_values)
                variance = sum((x - mean_val) ** 2 for x in gene_values) / len(gene_values)
                diversity += variance ** 0.5
            diversity /= len(FEEDS)

        # Update best overall
        if gen_best_fit > best_fit:
            best_fit = gen_best_fit
            best_chrom = gen_best_chrom[:]

        # Decode untuk reporting
        totals = decode_chromosome(best_chrom)
        
        # Detailed generation info
        gen_detail = {
            "gen": gen,
            "best_fitness": gen_best_fit,
            "avg_fitness": avg_fit,
            "worst_fitness": worst_fit,
            "diversity": diversity,
            "prdd": totals["prdd"],
            "mp": totals["mp"],
            "cost": totals["cost"],
            "composition": [gene for gene in best_chrom]
        }
        detailed_history.append(gen_detail)
        
        # Callback untuk progress update
        if progress_callback:
            progress_callback(gen, best_chrom, best_fit, totals)

        # Generate offspring
        offspring: List[Chromosome] = []

        # Crossover
        num_offspring_cross = int(_crossover_rate * _pop_size)
        if num_offspring_cross % 2 == 1:
            num_offspring_cross += 1

        for _ in range(num_offspring_cross // 2):
            p1 = random.choice(population)
            p2 = random.choice(population)
            c1, c2 = extended_intermediate_crossover(p1, p2)
            offspring.append(c1)
            offspring.append(c2)

        # Mutation
        num_offspring_mut = int(_mutation_rate * _pop_size)
        for _ in range(num_offspring_mut):
            parent = random.choice(population)
            child = mutate(parent)
            offspring.append(child)

        # Seleksi: gabungkan populasi dan offspring, ambil POP_SIZE terbaik
        combined = population + offspring
        combined_fits = [(ind, fitness(ind)) for ind in combined]
        combined_fits.sort(key=lambda x: x[1], reverse=True)

        population = [ind for (ind, fit_val) in combined_fits[:_pop_size]]

    best_totals = decode_chromosome(best_chrom)
    
    # Restore original FEEDS
    FEEDS = original_feeds
    
    return best_chrom, best_totals, best_fit, detailed_history



def format_result(chrom: Chromosome, totals: Dict, best_fit: float, feeds: Optional[List[Dict]] = None) -> Dict:
    """
    Format hasil untuk output
    
    Args:
        chrom: Kromosom terbaik
        totals: Total nutrisi dan biaya
        best_fit: Fitness terbaik
        feeds: Custom feeds data (None = use default from config)
    
    Returns:
        Dict hasil terformat
    """
    _feeds = feeds if feeds is not None else FEEDS
    
    composition = []
    for gene, feed in zip(chrom, _feeds):
        composition.append({
            "name": feed["name"],
            "weight": round(gene, 4),
            "price": feed["price"],
            "prdd": feed["prdd"],
            "mp": feed["mp"],
            "total_cost": round(gene * feed["price"], 2),
            "total_prdd": round(gene * feed["prdd"], 4),
            "total_mp": round(gene * feed["mp"], 4)
        })
    
    return {
        "composition": composition,
        "totals": {
            "prdd": round(totals["prdd"], 4),
            "mp": round(totals["mp"], 4),
            "cost": round(totals["cost"], 2)
        },
        "requirements": {
            "prdd": REQUIRED_PRDD,
            "mp": REQUIRED_MP
        },
        "fitness": round(best_fit, 10)
    }

