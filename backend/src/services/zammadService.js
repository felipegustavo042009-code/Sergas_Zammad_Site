const axios = require("axios");

class ZammadService {
  constructor() {
    this.baseURL =
      process.env.ZAMMAD_URL ||
      "https://jovemtech.sergipegas.com.br/api/v1/tickets";
    this.token = process.env.ZAMMAD_TOKEN;

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Token token=${this.token}`,
        "Content-Type": "application/json",
      },
    });
  }

  async createTicket(ticketData) {
    try {
      const response = await this.client.post("", {
        title: ticketData.title,
        group: ticketData.group,
        customer: ticketData.customer,
        article: {
          subject: ticketData.subject,
          body: ticketData.body,
          type: ticketData.type || "note",
          internal: ticketData.internal || false,
        },
        priority: ticketData.priority || "2 normal",
      });

      return {
        success: true,
        data: response.data,
        message: `Ticket criado com sucesso. ID: ${response.data.id}`,
      };
    } catch (error) {
      return this.handleError(error, "Erro ao criar ticket");
    }
  }

  async getOpenTickets() {
    try {
      const response = await this.client.get("?state=open");

      return {
        success: true,
        data: response.data,
        count: response.data.length || 0,
        message: `Total de ${response.data.length || 0} tickets em aberto`,
      };
    } catch (error) {
      return this.handleError(error, "Erro ao listar tickets em aberto");
    }
  }

  async getTicketById(ticketId) {
    try {
      const response = await this.client.get(`/${ticketId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(
        error,
        `Erro ao buscar ticket com ID ${ticketId}`,
      );
    }
  }

  async updateTicket(ticketId, updateData) {
    try {
      const response = await this.client.put(`/${ticketId}`, updateData);

      return {
        success: true,
        data: response.data,
        message: `Ticket ${ticketId} atualizado com sucesso`,
      };
    } catch (error) {
      return this.handleError(error, `Erro ao atualizar ticket ${ticketId}`);
    }
  }

  async addArticleToTicket(ticketId, articleData) {
    try {
      const response = await this.client.post(`/${ticketId}/articles`, {
        subject: articleData.subject,
        body: articleData.body,
        type: articleData.type || "note",
        internal: articleData.internal || false,
      });

      return {
        success: true,
        data: response.data,
        message: "Comentário adicionado com sucesso",
      };
    } catch (error) {
      return this.handleError(
        error,
        `Erro ao adicionar comentário ao ticket ${ticketId}`,
      );
    }
  }

  async searchTickets(query) {
    try {
      const response = await this.client.get(
        `?search=${encodeURIComponent(query)}`,
      );

      return {
        success: true,
        data: response.data,
        count: response.data.length || 0,
      };
    } catch (error) {
      return this.handleError(error, "Erro ao buscar tickets");
    }
  }

  async getAllTickets() {
    try {
      const response = await this.client.get("");

      return {
        success: true,
        data: response.data,
        count: response.data.length || 0,
        message: `Total de ${response.data.length || 0} tickets`,
      };
    } catch (error) {
      return this.handleError(error, "Erro ao listar todos os tickets");
    }
  }

  handleError(error, defaultMessage) {
    console.error(defaultMessage, error.message);

    return {
      success: false,
      error: error.response?.data || error.message,
      statusCode: error.response?.status || 500,
      message: defaultMessage,
    };
  }
}

module.exports = new ZammadService();
