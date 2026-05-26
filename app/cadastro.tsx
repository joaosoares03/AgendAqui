import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Animated,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, CadastroClienteRequest } from '../services/api';
import { useAuth } from '../hooks/useAuth';

SplashScreen.preventAutoHideAsync();

export default function Cadastro() {
  const router = useRouter();
  const { login } = useAuth();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [carregando, setCarregando] = useState(false);
  const [cpfValido, setCpfValido] = useState<boolean | null>(null);
  
  // States for focus styles
  const [focusStates, setFocusStates] = useState<Record<string, boolean>>({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfSenha, setMostrarConfSenha] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (fontsLoaded) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();
    }
  }, [fontsLoaded]);

  const handleFocus = (field: string) => setFocusStates(prev => ({ ...prev, [field]: true }));
  const handleBlur = (field: string) => setFocusStates(prev => ({ ...prev, [field]: false }));

  const formatarCpf = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      let formatted = numbers;
      if (numbers.length > 3) formatted = numbers.substring(0, 3) + '.' + numbers.substring(3);
      if (numbers.length > 6) formatted = formatted.substring(0, 7) + '.' + formatted.substring(7);
      if (numbers.length > 9) formatted = formatted.substring(0, 11) + '-' + formatted.substring(11, 13);
      return formatted;
    }
    return numbers.substring(0, 14);
  };

  const formatarTelefone = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      let formatted = numbers;
      if (numbers.length > 2) formatted = '(' + numbers.substring(0, 2) + ') ' + numbers.substring(2);
      if (numbers.length > 7) formatted = formatted.substring(0, 10) + '-' + formatted.substring(10);
      return formatted;
    }
    return numbers.substring(0, 15);
  };

  const validarCPF = (cpf: string): boolean => {
    const nums = cpf.replace(/\D/g, '');
    if (nums.length !== 11) return false;
    if (/^(\d)\1+$/.test(nums)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(nums[i]) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(nums[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(nums[i]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(nums[10])) return false;

    return true;
  };

  const handleCpfChange = (text: string) => {
    const formatado = formatarCpf(text);
    setCpf(formatado);
    const nums = formatado.replace(/\D/g, '');
    if (nums.length === 11) {
      setCpfValido(validarCPF(formatado));
    } else {
      setCpfValido(null);
    }
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!senha) return { score: 0, text: '', color: '#E2E8F0' };
    
    let score = 0;
    if (senha.length >= 6) score += 1;
    if (senha.length >= 8) score += 1;
    if (/[A-Z]/.test(senha)) score += 1;
    if (/[0-9]/.test(senha)) score += 1;
    if (/[^A-Za-z0-9]/.test(senha)) score += 1;
    
    if (score <= 1) return { score, text: 'Fraca', color: '#EF4444' };
    if (score <= 3) return { score, text: 'Razoável', color: '#F59E0B' };
    return { score, text: 'Forte', color: '#10B981' };
  };
  
  const strength = getPasswordStrength();

  const validarCampos = (): boolean => {
    if (!nome || !cpf || !telefone || !email || !senha || !confirmarSenha) {
      Alert.alert('Campos incompletos', 'Por favor, preencha todos os campos do formulário.');
      return false;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Senhas diferentes', 'A senha e a confirmação não coincidem.');
      return false;
    }
    if (senha.length < 6) {
      Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    if (!validarCPF(cpf)) {
      Alert.alert('CPF inválido', 'Digite um CPF válido para continuar.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Email inválido', 'Por favor, insira um endereço de email válido.');
      return false;
    }
    return true;
  };

  const fazerCadastro = async () => {
    if (!validarCampos()) return;

    try {
      setCarregando(true);

      const emailExiste = await api.verificarEmailCliente(email);
      if (emailExiste) {
        Alert.alert('Email já em uso', 'Este endereço de email já está cadastrado em nosso sistema.');
        return;
      }

      const cpfLimpo = cpf.replace(/\D/g, '');
      const cpfExiste = await api.verificarCpfCliente(cpfLimpo);
      if (cpfExiste) {
        Alert.alert('CPF já em uso', 'Este CPF já está cadastrado em nosso sistema.');
        return;
      }

      const dadosCadastro: CadastroClienteRequest = {
        nome: nome.trim(),
        cpf: cpfLimpo,
        telefone: telefone.replace(/\D/g, ''),
        email: email.trim().toLowerCase(),
        senha: senha.trim(),
      };

      await api.cadastrarCliente(dadosCadastro);
      await login(email, senha);

      // Redireciona direto para o menu conforme solicitado
      router.replace('/menu');

    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      Alert.alert('Ops!', error.message || 'Falha ao realizar cadastro. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient 
      colors={['#0F172A', '#1E3A8A', '#0B1F44']} 
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={estilos.container} 
      onLayout={onLayoutRootView}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={estilos.scroll} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity 
            style={estilos.botaoVoltarTopo} 
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <Animated.View style={[estilos.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            
            <View style={estilos.logoContainer}>
              <View style={estilos.logoBg}>
                <Image source={require('../assets/images/logoedcarpng.png')} style={estilos.logo} resizeMode="contain" />
              </View>
              <Text style={estilos.titulo}>Criar conta</Text>
              <Text style={estilos.subtitulo}>Preencha seus dados para começar</Text>
            </View>

            <View style={estilos.formContainer}>
              {/* Nome */}
              <View style={[estilos.inputContainer, focusStates['nome'] && estilos.inputContainerFocused]}>
                <Ionicons name="person-outline" size={20} color={focusStates['nome'] ? '#3B82F6' : '#94A3B8'} style={estilos.inputIcon} />
                <TextInput
                  style={estilos.input}
                  placeholder="Nome completo"
                  placeholderTextColor="#94A3B8"
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="words"
                  onFocus={() => handleFocus('nome')}
                  onBlur={() => handleBlur('nome')}
                />
              </View>

              {/* CPF */}
              <View style={estilos.fieldWrapper}>
                <View style={[
                  estilos.inputContainer, 
                  focusStates['cpf'] && estilos.inputContainerFocused,
                  cpfValido === false && estilos.inputContainerErro,
                  cpfValido === true && estilos.inputContainerSucesso,
                ]}>
                  <Ionicons name="card-outline" size={20} color={cpfValido === false ? '#EF4444' : cpfValido === true ? '#10B981' : (focusStates['cpf'] ? '#3B82F6' : '#94A3B8')} style={estilos.inputIcon} />
                  <TextInput
                    style={estilos.input}
                    placeholder="CPF (000.000.000-00)"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={cpf}
                    onChangeText={handleCpfChange}
                    maxLength={14}
                    onFocus={() => handleFocus('cpf')}
                    onBlur={() => handleBlur('cpf')}
                  />
                  {cpfValido !== null && (
                    <Ionicons 
                      name={cpfValido ? "checkmark-circle" : "close-circle"} 
                      size={20} 
                      color={cpfValido ? '#10B981' : '#EF4444'} 
                    />
                  )}
                </View>
                {cpfValido === false && <Text style={estilos.textoErro}>CPF inválido</Text>}
              </View>

              {/* Telefone */}
              <View style={[estilos.inputContainer, focusStates['telefone'] && estilos.inputContainerFocused]}>
                <Ionicons name="call-outline" size={20} color={focusStates['telefone'] ? '#3B82F6' : '#94A3B8'} style={estilos.inputIcon} />
                <TextInput
                  style={estilos.input}
                  placeholder="Telefone (celular)"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={telefone}
                  onChangeText={(text) => setTelefone(formatarTelefone(text))}
                  maxLength={15}
                  onFocus={() => handleFocus('telefone')}
                  onBlur={() => handleBlur('telefone')}
                />
              </View>

              {/* Email */}
              <View style={[estilos.inputContainer, focusStates['email'] && estilos.inputContainerFocused]}>
                <Ionicons name="mail-outline" size={20} color={focusStates['email'] ? '#3B82F6' : '#94A3B8'} style={estilos.inputIcon} />
                <TextInput
                  style={estilos.input}
                  placeholder="E-mail"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                />
              </View>

              {/* Senha */}
              <View style={estilos.fieldWrapper}>
                <View style={[estilos.inputContainer, focusStates['senha'] && estilos.inputContainerFocused]}>
                  <Ionicons name="lock-closed-outline" size={20} color={focusStates['senha'] ? '#3B82F6' : '#94A3B8'} style={estilos.inputIcon} />
                  <TextInput
                    style={estilos.input}
                    placeholder="Crie uma senha"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!mostrarSenha}
                    value={senha}
                    onChangeText={setSenha}
                    onFocus={() => handleFocus('senha')}
                    onBlur={() => handleBlur('senha')}
                  />
                  <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={{ padding: 4 }}>
                    <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
                
                {senha.length > 0 && (
                  <View style={estilos.strengthContainer}>
                    <View style={estilos.strengthBars}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <View 
                          key={level} 
                          style={[
                            estilos.strengthBar, 
                            { backgroundColor: level <= strength.score ? strength.color : '#E2E8F0' }
                          ]} 
                        />
                      ))}
                    </View>
                    <Text style={[estilos.strengthText, { color: strength.color }]}>
                      Senha {strength.text.toLowerCase()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirmar Senha */}
              <View style={estilos.fieldWrapper}>
                <View style={[
                  estilos.inputContainer, 
                  focusStates['confirmar'] && estilos.inputContainerFocused,
                  confirmarSenha.length > 0 && senha !== confirmarSenha && estilos.inputContainerErro
                ]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={focusStates['confirmar'] ? '#3B82F6' : '#94A3B8'} style={estilos.inputIcon} />
                  <TextInput
                    style={estilos.input}
                    placeholder="Confirme a senha"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!mostrarConfSenha}
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    onFocus={() => handleFocus('confirmar')}
                    onBlur={() => handleBlur('confirmar')}
                  />
                  <TouchableOpacity onPress={() => setMostrarConfSenha(!mostrarConfSenha)} style={{ padding: 4 }}>
                    <Ionicons name={mostrarConfSenha ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
                {confirmarSenha.length > 0 && senha !== confirmarSenha && (
                  <Text style={estilos.textoErro}>As senhas não coincidem</Text>
                )}
              </View>

              <TouchableOpacity
                style={[estilos.botao, carregando && estilos.botaoDesabilitado]}
                onPress={fazerCadastro}
                disabled={carregando}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={carregando ? ['#64748B', '#475569'] : ['#3B82F6', '#1D4ED8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={estilos.botaoGradient}
                >
                  {carregando ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Text style={estilos.textoBotao}>Criar Conta</Text>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={estilos.loginLinkContainer}>
                <Text style={estilos.textoNormal}>Já tem uma conta? </Text>
                <TouchableOpacity onPress={() => router.replace('/login')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={estilos.textoDestaque}>Faça login</Text>
                </TouchableOpacity>
              </View>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1 },
  scroll: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  botaoVoltarTopo: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 450,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: { alignItems: 'center', marginBottom: 28 },
  logoBg: {
    width: 72,
    height: 72,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: { width: 44, height: 44 },
  titulo: { 
    fontSize: 26, 
    fontFamily: 'Poppins_700Bold', 
    color: '#0F172A',
  },
  subtitulo: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
    marginTop: 4,
  },
  formContainer: { width: '100%' },
  fieldWrapper: { marginBottom: 16 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16, // Default for non-wrapped inputs
  },
  inputContainerFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
  },
  inputContainerErro: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputContainerSucesso: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: '#0F172A',
  },
  textoErro: { 
    fontSize: 12, 
    fontFamily: 'Poppins_400Regular', 
    color: '#EF4444', 
    marginTop: 4,
    marginLeft: 8 
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    marginRight: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
  },
  botao: { 
    width: '100%', 
    borderRadius: 16, 
    overflow: 'hidden', 
    marginTop: 12,
    marginBottom: 24,
  },
  botaoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  botaoDesabilitado: { opacity: 0.7 },
  textoBotao: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontFamily: 'Poppins_600SemiBold' 
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoNormal: {
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
    fontSize: 14,
  },
  textoDestaque: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#3B82F6',
    fontSize: 14,
  }
});