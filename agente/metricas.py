import os
import psutil

gib = 1024 ** 3
ram = psutil.virtual_memory()
unidade =  os.environ.get("SystemDrive", "C:") + "\\"
disco = psutil.disk_usage(unidade)

print(f"Uso de CPU: {psutil.cpu_percent(interval=1)}%")
print(f"RAM {ram.percent}%")
print(f"RAM Disponível: {ram.available / gib:.1f} GB")
print(f"Uso de disco: {disco.percent}%")