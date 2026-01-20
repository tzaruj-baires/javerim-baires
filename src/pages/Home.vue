<template>
<div class="container-md p-3">
    <h1>Home</h1>
    <button @click="addUser" class="btn btn-success">Agregar Usuario</button>
    
</div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getUsers, createUser } from "../services/api.js";

const users = ref([]);

onMounted(async () => {
  const res = await getUsers();
  users.value = res.data;
});

const addUser = async () => {
  await createUser({
    id: Date.now(),
    nombre: "Carlos",
    email: "carlos@mail.com",
    edad: 28
  });
};
</script>
