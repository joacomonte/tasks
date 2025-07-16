// /src/api/mockApi.js

class MockApi {
  constructor(taskCount = 10000) {
    this.tasks = [];
    this._initialize(taskCount);
  }

  /**
   * Genera el set de datos inicial en memoria.
   * Se ejecuta solo una vez.
   * @private
   */
  _initialize(taskCount) {
    for (let i = 1; i <= taskCount; i++) {
      this.tasks.push({
        id: `task-${i}`,
        text: `Tarea autogenerada #${i}. Revisar el flujo de usuario ${String.fromCharCode(65 + (i % 26))}.`,
        completed: Math.random() > 0.8, // ~20% completadas
      });
    }
    console.log(`✅ Mock API inicializada con ${this.tasks.length} tareas en memoria.`);
  }

  /**
   * Simula la obtención de tareas de forma paginada.
   * @param {{page?: number, limit?: number}} options
   * @returns {Promise<{tasks: Array<object>, hasNextPage: boolean}>}
   */
  async fetchTasks({ page = 1, limit = 10 }) {
    const latency = Math.random() * 600 + 400; // Latencia entre 400ms y 1000ms
    await new Promise(resolve => setTimeout(resolve, latency));

    if (Math.random() < 0.1) { // 10% de probabilidad de fallo
      throw new Error("Error de servidor: No se pudieron obtener las tareas.");
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = this.tasks.slice(startIndex, endIndex);

    return {
      tasks: paginatedTasks,
      hasNextPage: endIndex < this.tasks.length,
    };
  }

  /**
   * Simula la creación de una nueva tarea, agregándola al inicio del array en memoria.
   * @param {string} text
   * @returns {Promise<object>}
   */
  async createTask(text) {
    await new Promise(resolve => setTimeout(resolve, 600));

    if (Math.random() < 0.15) { // 15% de probabilidad de fallo
      throw new Error("Error de validación: La tarea no pudo ser creada.");
    }
    
    if (!text || text.trim().length < 3) {
      throw new Error("El texto de la tarea debe tener al menos 3 caracteres.");
    }

    const newTask = {
      id: `task-${Date.now()}`,
      text: text.trim(),
      completed: false,
    };

    // Agrega la nueva tarea al principio de la lista (más común en apps de tareas)
    this.tasks.unshift(newTask);

    return newTask;
  }
}

// Exportamos una única instancia para que actúe como un singleton
const mockApiService = new MockApi();
export default mockApiService;