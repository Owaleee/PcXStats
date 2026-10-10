"""Associa o LUID dos contadores ao nome do adaptador pelo DXGI do Windows.

Retorna apenas adaptadores que o Windows nao classifica como software.
Nao depende de uma fabricante e nao exige pacotes adicionais.
"""

import ctypes as ct
from ctypes import wintypes
import uuid


class _Luid(ct.Structure):
    _fields_ = [
        ("LowPart", wintypes.DWORD),
        ("HighPart", wintypes.LONG),
    ]


class _AdapterDesc1(ct.Structure):
    _fields_ = [
        ("Description", wintypes.WCHAR * 128),
        ("VendorId", wintypes.UINT),
        ("DeviceId", wintypes.UINT),
        ("SubSysId", wintypes.UINT),
        ("Revision", wintypes.UINT),
        ("DedicatedVideoMemory", ct.c_size_t),
        ("DedicatedSystemMemory", ct.c_size_t),
        ("SharedSystemMemory", ct.c_size_t),
        ("AdapterLuid", _Luid),
        ("Flags", wintypes.UINT),
    ]


def _metodo(ponteiro, indice, retorno, *argumentos):
    tabela = ct.cast(ponteiro, ct.POINTER(ct.POINTER(ct.c_void_p))).contents
    assinatura = ct.WINFUNCTYPE(retorno, ct.c_void_p, *argumentos)
    return assinatura(tabela[indice])


def _verificar(resultado, operacao):
    if resultado < 0:
        raise OSError(f"{operacao} falhou: 0x{resultado & 0xffffffff:08x}")


def listar_adaptadores_gpu():
    """Devolve {LUID: nome} dos adaptadores DXGI que nao sao de software.

    A enumeracao e refeita para acompanhar mudancas de adaptador/driver.
    Uma falha e propagada para o tratamento de indisponibilidade da API.
    """
    dxgi = ct.WinDLL("dxgi.dll")
    dxgi.CreateDXGIFactory1.argtypes = [ct.c_void_p, ct.POINTER(ct.c_void_p)]
    dxgi.CreateDXGIFactory1.restype = wintypes.LONG

    # IID_IDXGIFactory1, definido pelo SDK do Windows.
    iid = (ct.c_ubyte * 16).from_buffer_copy(
        uuid.UUID("770aae78-f26f-4dba-a829-253c83d1b387").bytes_le
    )
    fabrica = ct.c_void_p()
    _verificar(
        dxgi.CreateDXGIFactory1(ct.byref(iid), ct.byref(fabrica)),
        "CreateDXGIFactory1",
    )
    if not fabrica.value:
        raise OSError("DXGI nao devolveu uma fabrica valida.")

    try:
        # IDXGIFactory1::EnumAdapters1 ocupa a posicao 12 da interface COM.
        enumerar = _metodo(
            fabrica, 12, wintypes.LONG,
            wintypes.UINT, ct.POINTER(ct.c_void_p),
        )
        nomes = {}
        indice = 0
        while True:
            adaptador = ct.c_void_p()
            resultado = enumerar(fabrica, indice, ct.byref(adaptador))
            if resultado & 0xffffffff == 0x887A0002:  # DXGI_ERROR_NOT_FOUND
                break
            _verificar(resultado, "EnumAdapters1")
            if not adaptador.value:
                raise OSError("DXGI nao devolveu um adaptador valido.")

            try:
                descricao = _AdapterDesc1()
                # IDXGIAdapter1::GetDesc1 ocupa a posicao 10.
                obter_descricao = _metodo(
                    adaptador, 10, wintypes.LONG, ct.POINTER(_AdapterDesc1),
                )
                _verificar(
                    obter_descricao(adaptador, ct.byref(descricao)),
                    "GetDesc1",
                )
                # DXGI_ADAPTER_FLAG_SOFTWARE = 2. Nao filtramos por uso de 0%.
                if not descricao.Flags & 2:
                    luid = (
                        f"0x{descricao.AdapterLuid.HighPart & 0xffffffff:08x}_"
                        f"0x{descricao.AdapterLuid.LowPart:08x}"
                    )
                    nome = descricao.Description.strip()
                    if nome:
                        nomes[luid] = nome
            finally:
                _metodo(adaptador, 2, wintypes.ULONG)(adaptador)  # Release
            indice += 1
        return nomes
    finally:
        _metodo(fabrica, 2, wintypes.ULONG)(fabrica)  # Release


if __name__ == "__main__":
    for luid, nome in listar_adaptadores_gpu().items():
        print(f"{nome}: {luid}")
