const zammadService = require("../services/zammadService");

class TicketController {
  async create(req, res) {
    try {
      const {
        title,
        group,
        customer,
        subject,
        body,
        type,
        internal,
        priority,
      } = req.body;

      // Validação dos campos obrigatórios
      if (!title || !group || !customer || !subject || !body) {
        return res.status(400).json({
          success: false,
          message:
            "Campos obrigatórios faltando: title, group, customer, subject, body",
        });
      }

      const ticketData = {
        title,
        group,
        customer,
        subject,
        body,
        type: type || "note",
        internal: internal || false,
        priority: priority || "2 normal",
      };

      const result = await zammadService.createTicket(ticketData);

      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(result.statusCode || 400).json(result);
      }
    } catch (error) {
      console.error("Erro no controller create:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

  async getOpen(req, res) {
    try {
      const result = await zammadService.getOpenTickets();

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(result.statusCode || 400).json(result);
      }
    } catch (error) {
      console.error("Erro no controller getOpen:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

  async getAll(req, res) {
    try {
      const result = await zammadService.getAllTickets();

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(result.statusCode || 400).json(result);
      }
    } catch (error) {
      console.error("Erro no controller getAll:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID do ticket é obrigatório",
        });
      }

      const result = await zammadService.getTicketById(id);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(result.statusCode || 400).json(result);
      }
    } catch (error) {
      console.error("Erro no controller getById:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID do ticket é obrigatório",
        });
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Nenhum dado para atualizar",
        });
      }

      const result = await zammadService.updateTicket(id, updateData);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(result.statusCode || 400).json(result);
      }
    } catch (error) {
      console.error("Erro no controller update:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { subject, body, type, internal } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID do ticket é obrigatório",
        });
      }

      if (!subject || !body) {
        return res.status(400).json({
          success: false,
          message: "Campos obrigatórios faltando: subject, body",
        });
      }

      const articleData = {
        subject,
        body,
        type: type || "note",
        internal: internal || false,
      };

      const result = await zammadService.addArticleToTicket(id, articleData);

      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(result.statusCode || 400).json(result);
      }
    } catch (error) {
      console.error("Erro no controller addComment:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

  async search(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Parâmetro de busca (q) é obrigatório",
        });
      }

      const result = await zammadService.searchTickets(q);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(result.statusCode || 400).json(result);
      }
    } catch (error) {
      console.error("Erro no controller search:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }
}

module.exports = new TicketController();
