 async function includeHTML(id, file) {
      const response = await fetch(file);
      if (response.ok) {
        document.getElementById(id).innerHTML = await response.text();
      } else {
        console.error(`Impossible de charger ${file}`);
      }
    }

    includeHTML("footer", "footer.html");