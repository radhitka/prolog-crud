let navbar = document.getElementById("navbar");

// Add navbar component
navbar.className = "w-full bg-white shadow-md py-4";
navbar.insertAdjacentHTML(
  "beforeend",
  `
    <div class="container mx-auto flex justify-between items-center px-6">
        <a href="#" class="text-2xl font-bold">baca.quran</a>
        <div class="flex space-x-5">
          <a href="/" class="font-semibold text-gray-700 hover:text-blue-500"
            >Home</a
          >
          <a
            href="/surah"
            class="font-semibold text-gray-700 hover:text-blue-500"
            >Surah</a
          >
          <a
            href="/profile"
            id="profile-link"
            class="font-semibold text-gray-700 hover:text-blue-500 hidden"
            >Profile</a
          >
          <a
            href="/login"
            id="login-link"
            class="font-semibold text-gray-700 hover:text-blue-500"
            >Login</a
          >
        </div>
      </div>
    `
);
