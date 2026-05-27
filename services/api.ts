const API_BASE_URL = 'http://192.168.0.7:8080/api';

export interface Agendamento {
  id: number;
  cliente: Cliente;
  servico: Servico;
  modeloCarro: string;
  dataAgendamento: string;
  horario: string;
  status: string;
  dataCriacao: string;
}

export interface AgendamentoRequest {
  clienteId: number;
  servicoId: number;
  modeloCarro: string;
  dataAgendamento: string;
  horario: string;
}

export interface HorarioDisponivelResponse {
  horarios: string[];
}

export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  dataCadastro: string;
  cpf: string;
  senha: string;
}

export interface Administrador {
  id: number;
  cpf: string;
  dataCadastro: string;
  email: string;
  nome: string;
  senha: string;
  telefone: string;
  ativo: boolean;
}

export interface Funcionario {
  id: number;
  cpf: string;
  dataCadastro: string;
  email: string;
  nome: string;
  senha: string;
  telefone: string;
  ativo: boolean;
}

export interface CadastroFuncionarioRequest {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  telefone: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface VerificarEmailRequest {
  email: string;
}

export interface VerificarCpfRequest {
  cpf: string;
}

export interface CadastroClienteRequest {
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  senha: string;
}

export interface Servico {
  id: number;
  nome: string;
  descricao?: string;
  duracaoMin: number;
  preco: number;
  ativo: boolean;
  itensInclusos?: string[];
}

// Tipos para identificar o tipo de usuário
export type TipoUsuario = 'cliente' | 'funcionario' | 'administrador';

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  telefone?: string;
}

export const api = {
  // ======== AGENDAMENTOS ========
  async criarAgendamento(agendamentoData: AgendamentoRequest): Promise<Agendamento> {
    try {
      const response = await fetch(`${API_BASE_URL}/agendamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agendamentoData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao criar agendamento');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async getAllAgendamentos(): Promise<Agendamento[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/agendamentos`);
      if (!response.ok) {
        throw new Error('Erro ao buscar todos os agendamentos');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async getAgendamentosPorCliente(clienteId: number): Promise<Agendamento[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/agendamentos/cliente/${clienteId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar agendamentos');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async getHorariosDisponiveis(data: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/agendamentos/horarios-disponiveis/${data}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar horários disponíveis');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async cancelarAgendamento(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/agendamentos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao cancelar agendamento');
      }
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async verificarDisponibilidade(data: string, horario: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/agendamentos/verificar-disponibilidade?data=${data}&horario=${horario}`
      );
      if (!response.ok) {
        throw new Error('Erro ao verificar disponibilidade');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async getAgendamentosPorData(data: string): Promise<Agendamento[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/agendamentos/data/${data}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar agendamentos por data');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async getAgendamentoPorId(id: number): Promise<Agendamento> {
    try {
      const response = await fetch(`${API_BASE_URL}/agendamentos/${id}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar agendamento');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async atualizarStatusAgendamento(id: number, status: string): Promise<Agendamento> {
    try {
      const response = await fetch(`${API_BASE_URL}/agendamentos/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao atualizar status do agendamento');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },
  
  // ======== CADASTRO DE CLIENTE ========
  async cadastrarCliente(clienteData: CadastroClienteRequest): Promise<Cliente> {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clienteData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao cadastrar cliente');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async cadastrarFuncionario(funcionarioData: CadastroFuncionarioRequest): Promise<Funcionario> {
  try {
    const response = await fetch(`${API_BASE_URL}/funcionarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(funcionarioData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao cadastrar funcionário');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
},

async getFuncionarios(): Promise<Funcionario[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/funcionarios`);
    if (!response.ok) {
      throw new Error('Erro ao buscar funcionários');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
},

async verificarEmailFuncionario(email: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/funcionarios/verificar-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error('Erro ao verificar email do funcionário');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
},

async verificarCpfFuncionario(cpf: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/funcionarios/verificar-cpf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cpf }),
    });
    if (!response.ok) {
      throw new Error('Erro ao verificar CPF do funcionário');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
},

  // ======== VERIFICAÇÕES ========
  async verificarEmailCliente(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/verificar-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error('Erro ao verificar email');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async verificarCpfCliente(cpf: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/verificar-cpf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cpf }),
      });
      if (!response.ok) {
        throw new Error('Erro ao verificar CPF');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  // ======== LOGIN POR TIPO DE USUÁRIO ========
  async loginCliente(loginRequest: LoginRequest): Promise<Cliente> {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginRequest),
      });
      
      if (response.status === 401) {
        throw new Error('Email ou senha inválidos');
      }
      
      if (!response.ok) {
        throw new Error('Erro ao fazer login');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async loginAdministrador(loginRequest: LoginRequest): Promise<Administrador> {
    try {
      const response = await fetch(`${API_BASE_URL}/administradores/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginRequest),
      });
      
      if (response.status === 401) {
        throw new Error('Email ou senha inválidos');
      }
      
      if (!response.ok) {
        throw new Error('Erro ao fazer login como administrador');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async loginFuncionario(loginRequest: LoginRequest): Promise<Funcionario> {
    try {
      const response = await fetch(`${API_BASE_URL}/funcionarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginRequest),
      });
      
      if (response.status === 401) {
        throw new Error('Email ou senha inválidos');
      }
      
      if (!response.ok) {
        throw new Error('Erro ao fazer login como funcionário');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  // ======== SERVIÇOS ========
  async getServicos(): Promise<Servico[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/servicos`);
      if (!response.ok) {
        throw new Error('Erro ao buscar serviços');
      }
      const data = await response.json();
      
      return data.map((servico: any) => ({
        id: servico.id,
        nome: servico.nome,
        descricao: servico.descricao,
        duracaoMin: servico.duracaoMin,
        preco: servico.preco,
        ativo: servico.ativo
      }));
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  async getServicoById(id: number): Promise<Servico> {
    try {
      const response = await fetch(`${API_BASE_URL}/servicos/${id}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar serviço');
      }
      const servico = await response.json();
      
      return {
        id: servico.id,
        nome: servico.nome,
        descricao: servico.descricao,
        duracaoMin: servico.duracaoMin,
        preco: servico.preco,
        ativo: servico.ativo,
      };
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  }
};