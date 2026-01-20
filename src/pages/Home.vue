<template>
  <div class="container-fluid mt-4">
    <!-- Bienvenida y datos del usuario -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm bg-gradient-info text-white">
          <div class="card-body">
            <h2><i class="bi bi-house"></i> Bienvenido, {{ authStore.user?.nickname || authStore.user?.email }}</h2>
            <p class="mb-0">Nivel IT: <strong>{{ getLevelName(authStore.user?.it_level) }}</strong></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje de acceso restringido para nivel 0 -->
    <div v-if="authStore.user?.it_level === 0" class="row mb-4">
      <div class="col-12">
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
          <h5 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Acceso Restringido</h5>
          <p class="mb-0">
            Tu cuenta ha sido creada correctamente, pero requiere aprobación del administrador para acceder a las funcionalidades.
            <strong>Contacta con el administrador</strong> para que asigne tu nivel de acceso.
          </p>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      </div>
    </div>

    <!-- Grid de permisos (solo si tiene acceso) -->
    <div v-if="can(1)" class="row mb-4">
      <div class="col-md-4" v-if="can(1)">
        <div class="card shadow-sm border-success">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0"><i class="bi bi-unlock"></i> Nivel Básico (1+)</h5>
          </div>
          <div class="card-body">
            <p>Acceso a funciones básicas del sistema.</p>
          </div>
        </div>
      </div>

      <div class="col-md-4" v-if="can(2)">
        <div class="card shadow-sm border-warning">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0"><i class="bi bi-shield-lock"></i> Nivel Intermedio (2+)</h5>
          </div>
          <div class="card-body">
            <p>Acceso a análisis avanzado y reportes detallados.</p>
          </div>
        </div>
      </div>

      <div class="col-md-4" v-if="can(3)">
        <div class="card shadow-sm border-danger mt-3 mt-md-0">
          <div class="card-header bg-danger text-white">
            <h5 class="mb-0"><i class="bi bi-shield-exclamation"></i> Nivel Avanzado (3)</h5>
          </div>
          <div class="card-body">
            <p>Acceso a panel administrativo y gestión de usuarios.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de usuarios (visible para nivel 1+) -->
    <div class="row mb-4" v-if="can(1)">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-2"><i class="bi bi-people"></i> Usuarios</h5>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control form-control-sm" 
              placeholder="Buscar en todos los campos..."
            />
          </div>

          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th @click="sortBy('DNI')" class="cursor-pointer">
                      DNI {{ getSortIndicator('DNI') }}
                    </th>
                    <th @click="sortBy('nombre')" class="cursor-pointer">
                      Nombre {{ getSortIndicator('nombre') }}
                    </th>
                    <th @click="sortBy('apodo')" class="cursor-pointer">
                      Apodo {{ getSortIndicator('apodo') }}
                    </th>
                    <th v-if="can(2)" @click="sortBy('organizacion')" class="cursor-pointer">
                      Org. {{ getSortIndicator('organizacion') }}
                    </th>
                    <th @click="sortBy('mail')" class="cursor-pointer">
                      E-Mail {{ getSortIndicator('mail') }}
                    </th>
                    <th class="text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-if="loading">
                    <td :colspan="can(2) ? 6 : 5" class="text-center py-4">
                      <span class="spinner-border spinner-border-sm me-2"></span> Cargando...
                    </td>
                  </tr>

                  <tr v-else-if="filteredUsers.length === 0">
                    <td :colspan="can(2) ? 6 : 5" class="text-center py-4 text-muted">
                      No hay usuarios
                    </td>
                  </tr>

                  <tr v-else v-for="user in paginatedUsers" :key="user.id">
                    <td><small>{{ user.DNI }}</small></td>
                    <td>{{ user.nombre }} {{ user.apellido }}</td>
                    <td>{{ user.apodo }}</td>
                    <td v-if="can(2)">{{ user.organizacion }}</td>
                    <td><small>{{ user.mail_operativo || user.mail_personal || '-' }}</small></td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-outline-primary" v-if="can(2)" title="Editar">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" v-if="can(3)" title="Eliminar">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Paginación -->
          <div class="card-footer bg-light d-flex justify-content-between align-items-center">
            <small class="text-muted">
              Mostrando {{ paginatedUsers.length }} de {{ filteredUsers.length }} usuarios
            </small>
            <div>
              <button 
                v-if="displayedCount < filteredUsers.length"
                @click="loadMore" 
                class="btn btn-sm btn-outline-primary me-2"
              >
                <i class="bi bi-chevron-down"></i> Más
              </button>
              <button 
                v-if="displayedCount > itemsPerPage"
                @click="showLess" 
                class="btn btn-sm btn-outline-secondary"
              >
                <i class="bi bi-chevron-up"></i> Menos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info de permisos -->
    <div class="row">
      <div class="col-12">
        <div class="alert alert-info" role="alert">
          <h6 class="alert-heading"><i class="bi bi-info-circle"></i> Sistema de Permisos</h6>
          <small>
            Tu nivel: <strong>{{ authStore.user?.it_level }} ({{ getLevelName(authStore.user?.it_level) }})</strong> |
            Funcionalidades disponibles: 
            <span v-if="can(1)" class="badge bg-success me-1">Básico</span>
            <span v-if="can(2)" class="badge bg-warning text-dark me-1">Intermedio</span>
            <span v-if="can(3)" class="badge bg-danger">Avanzado</span>
            <span v-if="!can(1)" class="badge bg-secondary">Ninguna (Esperando aprobación)</span>
          </small>
        </div>
      </div>
    </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { getAll } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { usePermissions } from "@/composables/usePermissions";

const authStore = useAuthStore();
const { can, getLevelName } = usePermissions();

const users = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const displayedCount = ref(10);
const itemsPerPage = 10;
const sortKey = ref("");
const sortOrder = ref("asc");

const loadUsers = async () => {
  loading.value = true;
  try {
    const res = await getAll("main");
    users.value = res.data;
  } catch (err) {
    console.error("Error cargando usuarios", err);
  } finally {
    loading.value = false;
  }
};

const filteredUsers = computed(() => {
  let filtered = users.value.filter(user => {
    const mail = user.mail_operativo || user.mail_personal || "";
    return !(
      !user.DNI && !user.nombre && !user.apellido && !user.apodo && 
      !user.organizacion && !mail
    );
  });

  if (!searchQuery.value.trim()) {
    return filtered;
  }

  const query = searchQuery.value.toLowerCase();
  return filtered.filter(user => {
    const mail = user.mail_operativo || user.mail_personal || "";
    return (
      user.DNI.toString().toLowerCase().includes(query) ||
      `${user.nombre} ${user.apellido}`.toLowerCase().includes(query) ||
      user.apodo.toLowerCase().includes(query) ||
      user.organizacion.toLowerCase().includes(query) ||
      mail.toLowerCase().includes(query)
    );
  });
});

const sortedAndPaginated = computed(() => {
  let sorted = [...filteredUsers.value];

  if (sortKey.value) {
    sorted.sort((a, b) => {
      let aVal, bVal;

      if (sortKey.value === "nombre") {
        aVal = `${a.nombre} ${a.apellido}`.toLowerCase();
        bVal = `${b.nombre} ${b.apellido}`.toLowerCase();
      } else if (sortKey.value === "mail") {
        aVal = (a.mail_operativo || a.mail_personal || "").toLowerCase();
        bVal = (b.mail_operativo || b.mail_personal || "").toLowerCase();
      } else {
        aVal = a[sortKey.value];
        bVal = b[sortKey.value];

        if (!isNaN(aVal)) aVal = Number(aVal);
        if (!isNaN(bVal)) bVal = Number(bVal);

        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder.value === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder.value === "asc" ? 1 : -1;
      return 0;
    });
  }

  return sorted.slice(0, displayedCount.value);
});

const paginatedUsers = sortedAndPaginated;

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
};

const getSortIndicator = (key) => {
  if (sortKey.value !== key) return "";
  return sortOrder.value === "asc" ? "▲" : "▼";
};

const loadMore = () => {
  displayedCount.value += itemsPerPage;
};

const showLess = () => {
  displayedCount.value = itemsPerPage;
};

onMounted(loadUsers);
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.cursor-pointer:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.bg-gradient-info {
  background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
}

.card {
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
