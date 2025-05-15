<template>
  <div class="reset-container">
    <h2>Reset Password</h2>
    <div class="form-section">
      <input
        v-model="newPassword"
        type="password"
        placeholder="New Password"
      />
      <button class="btn" @click="resetPassword">Submit</button>

      <p v-if="message" :style="{ color: messageType === 'error' ? 'red' : 'green' }">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChangePass",
  data() {
    return {
      newPassword: "",
      message: "",
      messageType: "success",
    };
  },
  methods: {
    async resetPassword() {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token || !this.newPassword) {
        this.message = "Missing token or password";
        this.messageType = "error";
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/password-reset/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword: this.newPassword,
          }),
        });

        if (!res.ok) throw new Error();

        this.message = "Password reset successful!";
        this.messageType = "success";

        setTimeout(() => {
            this.$emit("changePage", "login"); //Emit to App.vue
            }, 2000);

      } catch {
        this.message = "Reset failed. Try again.";
        this.messageType = "error";
      }
    },
  },
};
</script>

<style scoped>
.reset-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.form-section {
  max-width: 300px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input {
  padding: 0.5rem;
  font-size: 1rem;
  width: 100%;
}

.btn {
  background-color: #176A02;
  color: white;
  padding: 0.6rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
