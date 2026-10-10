import os
import psutil

gib = 1024 ** 3
ram = psutil.virtual_memory()
unidade = os.environ.get("SystemDrive", "C:") + "\\"
disco = psutil.disk_usage(unidade)

print(f"CPU: {psutil.cpu_percent(interval=1)}%")
print(f"RAM: {ram.percent}%")
print(f"RAM total: {ram.total / gib:.1f} GiB")
print(f"RAM disponível: {ram.available / gib:.1f} GiB")
print(f"Disco ocupado: {disco.percent}%")