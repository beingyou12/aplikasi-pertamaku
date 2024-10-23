<script setup>
import { ref } from 'vue';
import CommentSection from './components/CommentSection.vue';

const userId = ref('');
const users = ref(null);
const newEmail = ref('');
const loading = ref(false);
const error = ref('');

const getUser = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await fetch(`http://localhost:3000/api/user/${userId.value}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    users.value = await response.json();
  } catch (err) {
    console.error(err);
    error.value = 'Error fetching user: ' + err.message;
  } finally {
    loading.value = false;
  }
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const changeEmail = async () => {
  if (!isValidEmail(newEmail.value)) {
    alert('Please enter a valid email address');
    return;
  }
  try {
    const response = await fetch(`http://localhost:3000/api/user/${userId.value}/change-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: newEmail.value }),
    });
    if (!response.ok) throw new Error('Failed to change email');
    alert('Email updated successfully');
  } catch (err) {
    console.error(err);
    alert('Error changing email: ' + err.message);
  }
};
</script>

<template>
  <div id="app">
    <h1>User Dashboard</h1>
    <div>
      <input v-model="userId" placeholder="Enter User ID" />
      <button @click="getUser" :disabled="loading">Get User Info</button>
    </div>
    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>
    <div v-if="users">
      <template v-for="user in users" :key="user.id">
        <h2>{{ user.name }}</h2>
        <p>Email: {{ user.email }}</p>
        <hr />
      </template>
    </div>
    <CommentSection />
    <form @submit.prevent="changeEmail">
      <h3>Change Email</h3>
      <input v-model="newEmail" placeholder="New Email" />
      <button type="submit">Submit</button>
    </form>
  </div>
</template>
