import { useEffect, useState } from 'react';
import {
  AppState, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { fetchStats } from './src/api';
import type { Connection, Stats } from './src/types';

type Status = 'disconnected' | 'connecting' | 'connected' | 'error' | 'paused';

const LABELS: Record<Status, string> = {
  disconnected: 'Desconectado',
  connecting: 'Conectando…',
  connected: 'Conectado',
  error: 'Sem dados atuais',
  paused: 'Atualização pausada',
};

function MetricCard({ title, percent, detail }: {
  title: string;
  percent: number;
  detail: string;
}) {
  const safePercent = Math.min(100, Math.max(0, percent));
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.value}>{safePercent.toFixed(1)}%</Text>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityLabel={title}
        accessibilityValue={{ min: 0, max: 100, now: safePercent }}
      >
        <View style={[styles.fill, { width: `${safePercent}%` }]} />
      </View>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

export default function App() {
  const [host, setHost] = useState('');
  const [token, setToken] = useState('');
  const [connection, setConnection] = useState<Connection | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [requestStatus, setRequestStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [error, setError] = useState('');
  const [appState, setAppState] = useState(AppState.currentState);

  // O status da tela deriva da conexão, do estado do app e da última consulta.
  const status: Status = !connection
    ? 'disconnected'
    : appState !== 'active' ? 'paused' : requestStatus;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setAppState(nextState);
      if (nextState === 'active') {
        setRequestStatus('connecting');
        setError('');
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!connection || appState !== 'active') return;
    const activeConnection = connection;

    let disposed = false;
    let nextPoll: ReturnType<typeof setTimeout> | undefined;
    let currentController: AbortController | undefined;

    async function poll() {
      const controller = new AbortController();
      currentController = controller;
      const deadline = setTimeout(() => controller.abort(), 5000);
      try {
        const data = await fetchStats(activeConnection, controller.signal);
        if (!disposed) {
          setStats(data);
          setRequestStatus('connected');
          setError('');
        }
      } catch (cause) {
        if (!disposed) {
          const message = controller.signal.aborted
            ? 'O PC não respondeu em 5 segundos.'
            : cause instanceof Error ? cause.message : 'Falha de conexão.';
          setRequestStatus('error');
          setError(message === 'Network request failed'
            ? 'Não foi possível acessar o PC. Confira IP, rede e agente.'
            : message);
        }
      } finally {
        clearTimeout(deadline);
        // Espera a resposta acabar antes de agendar outra: não sobrepõe pedidos.
        if (!disposed) nextPoll = setTimeout(poll, 3000);
      }
    }

    void poll();
    return () => {
      disposed = true;
      clearTimeout(nextPoll);
      currentController?.abort();
    };
  }, [connection, appState]);

  function connect() {
    const ip = host.trim();
    const parts = ip.split('.');
    const validIp = parts.length === 4 && parts.every((part) =>
      /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255
    );
    if (!validIp) {
      setError('Digite o IPv4 do PC, como 192.168.1.10, sem http ou porta.');
      return;
    }
    if (token.trim().length < 32) {
      setError('Cole a chave gerada no PC, com pelo menos 32 caracteres.');
      return;
    }
    setStats(null);
    setError('');
    setRequestStatus('connecting');
    setConnection({ baseUrl: `http://${ip}:8000`, token: token.trim() });
  }

  function disconnect() {
    setConnection(null);
    setStats(null);
    setError('');
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>PC Stats</Text>
          <Text style={styles.detail}>Seu computador, no celular · rede local</Text>
          <Text style={styles.status} accessibilityLiveRegion="polite">
            {LABELS[status]}
          </Text>

          <Text style={styles.label}>IPv4 do PC</Text>
          <TextInput
            style={styles.input}
            value={host}
            onChangeText={setHost}
            placeholder="192.168.1.10"
            placeholderTextColor="#94a3b8"
            accessibilityLabel="Endereço IPv4 do computador"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="decimal-pad"
            editable={!connection}
          />
          <Text style={styles.label}>Chave de acesso</Text>
          <TextInput
            style={styles.input}
            value={token}
            onChangeText={setToken}
            placeholder="Chave gerada no agente"
            placeholderTextColor="#94a3b8"
            accessibilityLabel="Chave de acesso ao computador"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!connection}
          />
          <Pressable
            style={styles.button}
            accessibilityRole="button"
            onPress={connection ? disconnect : connect}
          >
            <Text style={styles.buttonText}>{connection ? 'Desconectar' : 'Conectar'}</Text>
          </Pressable>

          {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}
          {stats ? (
            <>
              <Text style={styles.detail}>
                Última leitura: {new Date(stats.sampled_at).toLocaleTimeString('pt-BR')}
                {status !== 'connected' ? ' · valores anteriores' : ''}
              </Text>
              <MetricCard title="CPU" percent={stats.cpu_percent} detail="Uso total do processador" />
              <MetricCard
                title="Memória RAM"
                percent={stats.ram_percent}
                detail={`${stats.ram_used_gib.toFixed(1)} / ${stats.ram_total_gib.toFixed(1)} GiB em uso`}
              />
              <MetricCard
                title="Disco do Windows"
                percent={stats.disk_percent}
                detail={`${stats.disk_used_gib.toFixed(1)} / ${stats.disk_total_gib.toFixed(1)} GiB ocupados`}
              />                           {stats.gpus.map((gpu) => (
                <MetricCard
                  key={gpu.id}
                  title={gpu.name}
                  percent={gpu.usage_percent}
                  detail="Uso da GPU · 3D"
                />
              ))}

              {stats.gpus.length === 0 ? (
                <View style={styles.card}>
                  <Text style={styles.label}>GPU</Text>

                  <Text style={styles.detail}>
                    {stats.gpu_error ?? 'Leitura de GPU indisponível.'}
                  </Text>
                </View>
              ) : null}
            </>
          ) : <Text style={styles.detail}>Conecte para receber a primeira leitura.</Text>}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  container: { padding: 24, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  heading: { color: '#f8fafc', fontSize: 32, fontWeight: '700' },
  status: { color: '#67e8f9', fontSize: 16, fontWeight: '600' },
  label: { color: '#e2e8f0', fontSize: 16 },
  detail: { color: '#cbd5e1', fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#64748b', borderRadius: 10, padding: 14, color: '#f8fafc' },
  button: { backgroundColor: '#2563eb', padding: 16, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#fda4af', fontSize: 15 },
  card: { backgroundColor: '#1e293b', padding: 20, borderRadius: 16, gap: 10 },
  value: { color: '#f8fafc', fontSize: 36, fontWeight: '700' },
  track: { height: 10, backgroundColor: '#475569', borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#38bdf8' },
});
