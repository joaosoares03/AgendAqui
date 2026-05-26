import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, ScrollView, SafeAreaView, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, Agendamento } from '../../services/api';
import {
  useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useTema } from '../../contexts/ThemeContext';

type StatusInterface = 'PENDENTE' | 'APROVADO' | 'CONCLUIDO' | 'REJEITADO';

const mapearParaInterface = (s: string): StatusInterface => {
  switch (s.toLowerCase()) {
    case 'agendado': case 'confirmado': return 'APROVADO';
    case 'concluido': return 'CONCLUIDO';
    case 'cancelado': return 'REJEITADO';
    default: return 'PENDENTE';
  }
};

const mapearParaBackend = (s: StatusInterface): string => {
  switch (s) {
    case 'APROVADO':   return 'confirmado';
    case 'CONCLUIDO':  return 'concluido';
    case 'REJEITADO':  return 'cancelado';
    default:           return 'agendado';
  }
};

export default function GestaoAgendamentos() {
  const router = useRouter();
  const params = useLocalSearchParams<{ agendamentoId: string }>();
  const { tema, alternarTema, cores } = useTema();

  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [status, setStatus] = useState<StatusInterface>('PENDENTE');

  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold });

  const agendamentoId = params.agendamentoId ? parseInt(params.agendamentoId) : null;

  useEffect(() => {
    const carregar = async () => {
      if (!agendamentoId) {
        setCarregando(false);
        return;
      }
      try {
        setCarregando(true);
        const dados = await api.getAgendamentoPorId(agendamentoId);
        setAgendamento(dados);
        setStatus(mapearParaInterface(dados.status));
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar o agendamento');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [agendamentoId]);

  const atualizarStatus = async (novoStatus: StatusInterface) => {
    if (!agendamentoId) return;
    try {
      setAtualizando(true);
      const atualizado = await api.atualizarStatusAgendamento(agendamentoId, mapearParaBackend(novoStatus));
      setStatus(novoStatus);
      setAgendamento(atualizado);
      
      // Redireciona para o Resumo Financeiro ao confirmar
      router.replace('/admin/ResumoFinanceiro');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o status');
    } finally {
      setAtualizando(false);
    }
  };

  const formatarData = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');

  if (!fontsLoaded) return null;

  if (carregando) {
    return (
      <View style={[estilos.centralizado, { flex: 1, backgroundColor: cores.fundo }]}>
        <ActivityIndicator size="large" color={cores.botaoPrimario} />
      </View>
    );
  }

  if (!agendamento) {
    return (
      <View style={[estilos.centralizado, { flex: 1, backgroundColor: cores.fundo }]}>
        <Ionicons name="alert-circle-outline" size={64} color={cores.textoTerceiro} />
        <Text style={{ color: cores.textoTerceiro, fontFamily: 'Poppins_400Regular', marginTop: 12 }}>Agendamento não encontrado</Text>
        <TouchableOpacity style={[estilos.botaoPrimario, { backgroundColor: cores.botaoPrimario, marginTop: 20 }]} onPress={() => router.back()}>
          <Text style={estilos.botaoPrimarioTexto}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const acoes: { label: string; status: StatusInterface; cor: string }[] = [
    { label: 'Aprovar Agendamento',   status: 'APROVADO',  cor: cores.botaoPrimario },
    { label: 'Marcar como Concluído', status: 'CONCLUIDO', cor: '#16A34A' },
    { label: 'Cancelar Agendamento',  status: 'REJEITADO', cor: '#DC2626' },
  ];

  return (
    <SafeAreaView style={[estilos.container, { backgroundColor: cores.fundo }]}>
      {/* Header */}
      <View style={[estilos.header, { backgroundColor: cores.fundoHeader, borderBottomColor: cores.borda }]}>
        <TouchableOpacity style={[estilos.botaoIcone, { backgroundColor: cores.borda }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={cores.textoPrimario} />
        </TouchableOpacity>
        <Image source={require('../../assets/images/logoedcarpng.png')} style={estilos.logo} resizeMode="contain" />
        <TouchableOpacity style={[estilos.botaoIcone, { backgroundColor: cores.borda }]} onPress={alternarTema}>
          <Ionicons name={tema === 'escuro' ? 'sunny-outline' : 'moon-outline'} size={20} color={cores.textoPrimario} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={estilos.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[estilos.titulo, { color: cores.textoPrimario }]}>Gerenciar Agendamento</Text>
        <Text style={[estilos.subtitulo, { color: cores.textoSecundario }]}>#{agendamento.id}</Text>

        {/* Dados do agendamento */}
        <View style={[estilos.card, { backgroundColor: cores.fundoCard, borderColor: cores.borda }]}>
          <Text style={[estilos.cardTitulo, { color: cores.textoPrimario }]}>Informações</Text>
          {[
            { label: 'Serviço',  valor: agendamento.servico.nome },
            { label: 'Data',     valor: formatarData(agendamento.dataAgendamento) },
            { label: 'Horário',  valor: agendamento.horario },
            { label: 'Veículo',  valor: agendamento.modeloCarro },
          ].map((linha, i) => (
            <View key={i} style={[estilos.linha, { borderBottomColor: cores.borda }]}>
              <Text style={[estilos.linhaLabel, { color: cores.textoSecundario }]}>{linha.label}</Text>
              <Text style={[estilos.linhaValor, { color: cores.textoPrimario }]}>{linha.valor}</Text>
            </View>
          ))}
          <View style={[estilos.linha, { borderBottomWidth: 0 }]}>
            <Text style={[estilos.linhaLabel, { color: cores.textoSecundario }]}>Status</Text>
            <View style={[estilos.badge, {
              backgroundColor: status === 'APROVADO' ? '#DBEAFE' : status === 'CONCLUIDO' ? '#DCFCE7' : status === 'REJEITADO' ? '#FEE2E2' : '#FEF9C3'
            }]}>
              <Text style={[estilos.badgeTexto, {
                color: status === 'APROVADO' ? '#1E40AF' : status === 'CONCLUIDO' ? '#166534' : status === 'REJEITADO' ? '#991B1B' : '#854D0E'
              }]}>{status}</Text>
            </View>
          </View>
        </View>

        {/* Dados do cliente */}
        <View style={[estilos.card, { backgroundColor: cores.fundoCard, borderColor: cores.borda }]}>
          <Text style={[estilos.cardTitulo, { color: cores.textoPrimario }]}>Cliente</Text>
          {[
            { label: 'Nome',     valor: agendamento.cliente.nome },
            { label: 'Email',    valor: agendamento.cliente.email },
            { label: 'Telefone', valor: agendamento.cliente.telefone || 'Não informado' },
          ].map((linha, i, arr) => (
            <View key={i} style={[estilos.linha, { borderBottomColor: cores.borda, borderBottomWidth: i < arr.length - 1 ? 1 : 0 }]}>
              <Text style={[estilos.linhaLabel, { color: cores.textoSecundario }]}>{linha.label}</Text>
              <Text style={[estilos.linhaValor, { color: cores.textoPrimario }]}>{linha.valor}</Text>
            </View>
          ))}
        </View>

        {/* Ações */}
        <View style={[estilos.card, { backgroundColor: cores.fundoCard, borderColor: cores.borda }]}>
          <Text style={[estilos.cardTitulo, { color: cores.textoPrimario }]}>Ações</Text>
          {acoes.map((acao, i) => (
            <TouchableOpacity
              key={i}
              style={[
                estilos.botaoAcao,
                { backgroundColor: acao.cor, opacity: (atualizando || status === acao.status) ? 0.5 : 1 },
              ]}
              onPress={() => atualizarStatus(acao.status)}
              disabled={atualizando || status === acao.status}
              activeOpacity={0.8}
            >
              {atualizando ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={estilos.botaoAcaoTexto}>{acao.label}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1 },
  centralizado: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1 },
  botaoIcone: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 40, height: 40 },
  scroll: { padding: 20, paddingBottom: 40 },
  titulo: { fontFamily: 'Poppins_700Bold', fontSize: 22, marginBottom: 2 },
  subtitulo: { fontFamily: 'Poppins_400Regular', fontSize: 13, marginBottom: 20 },
  card: { borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1 },
  cardTitulo: { fontFamily: 'Poppins_700Bold', fontSize: 16, marginBottom: 12 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  linhaLabel: { fontFamily: 'Poppins_400Regular', fontSize: 13 },
  linhaValor: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, flex: 1, textAlign: 'right' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeTexto: { fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  botaoAcao: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 8 },
  botaoAcaoTexto: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#FFFFFF' },
  botaoPrimario: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  botaoPrimarioTexto: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#FFFFFF' },
});