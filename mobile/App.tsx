import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

function Card({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{titulo}</Text>
      <Text style={styles.value}>{valor.toFixed(1)}%</Text>
    </View>
  );
}

export default function App() {
  const [cpu, setCpu] = useState(25);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen}>
        <Text style={styles.title}>PC Stats · dados simulados</Text>
        <Card titulo="CPU" valor={cpu} />
        <Card titulo="Memória RAM" valor={50} />
        <Card titulo="Uso de Disco" valor={60} />
        <Button title="Simular outra leitura" onPress={() => setCpu(72)} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, backgroundColor: '#0f172a', gap: 16 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700' },
  card: { backgroundColor: '#1e293b', padding: 20, borderRadius: 12 },
  text: { color: '#cbd5e1', fontSize: 16 },
  value: { color: '#fff', fontSize: 32 },
});