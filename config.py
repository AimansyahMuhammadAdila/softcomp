# -*- coding: utf-8 -*-
"""
Konfigurasi untuk Algoritma Genetika Optimasi Pakan Sapi Perah
"""

# Data Pakan
FEEDS = [
    {
        "name": "Alang-alang",
        "price": 500,
        "prdd": 0.04,
        "mp": 0.45
    },
    {
        "name": "Kacang panjang",
        "price": 2500,
        "prdd": 0.16,
        "mp": 0.60
    },
    {
        "name": "Ampas tahu",
        "price": 1500,
        "prdd": 0.20,
        "mp": 0.70
    },
    {
        "name": "Bungkil kelapa",
        "price": 3000,
        "prdd": 0.22,
        "mp": 0.70
    }
]

# Nutrisi yang dibutuhkan 1 ekor sapi perah/hari (kg)
REQUIRED_PRDD = 1.036  # Protein (kg)
REQUIRED_MP = 7.5      # Martabat Pati (kg)

# Batas bawah dan atas bobot setiap bahan pakan (kg)
GEN_MIN = 0.0
GEN_MAX = 10.0

# Koefisien penalti jika nutrisi kurang
NUTRITION_PENALTY_COEFF = 1e6

# Parameter Algoritma Genetika
POP_SIZE = 100          # Ukuran populasi
MAX_GEN = 200           # Jumlah generasi maksimum
CROSSOVER_RATE = 0.3    # Tingkat crossover
MUTATION_RATE = 0.3     # Tingkat mutasi


def get_default_config():
    """
    Mengembalikan konfigurasi default untuk frontend
    """
    return {
        "feeds": FEEDS,
        "requirements": {
            "prdd": REQUIRED_PRDD,
            "mp": REQUIRED_MP
        },
        "parameters": {
            "pop_size": POP_SIZE,
            "max_gen": MAX_GEN,
            "crossover_rate": CROSSOVER_RATE,
            "mutation_rate": MUTATION_RATE
        },
        "constraints": {
            "gen_min": GEN_MIN,
            "gen_max": GEN_MAX
        }
    }

