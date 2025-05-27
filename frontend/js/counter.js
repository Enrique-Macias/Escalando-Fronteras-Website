document.addEventListener("DOMContentLoaded", function() {
	// Función para animar los números
	function animateCounters(counter) {
	  // El elemento 'counter' es tu span con la clase '.counter-number'
	  const endValue = parseInt(counter.getAttribute('data-to'), 10);
	  const duration = parseInt(counter.getAttribute('data-speed'), 10);
	  let startValue = parseInt(counter.getAttribute('data-from'), 10);
	  let startTime = null;
  
	  function updateCounter(currentTime) {
		if (!startTime) startTime = currentTime;
		const elapsedTime = currentTime - startTime;
		if (elapsedTime < duration) {
		  const value = startValue + (endValue - startValue) * (elapsedTime / duration);
		  counter.textContent = Math.floor(value);
		  requestAnimationFrame(updateCounter);
		} else {
		  counter.textContent = endValue;
		}
	  }
  
	  requestAnimationFrame(updateCounter);
	}
  
	// Configuración del Intersection Observer
	let observer = new IntersectionObserver((entries, observer) => {
	  entries.forEach(entry => {
		if (entry.isIntersecting) {
		  animateCounters(entry.target);
		  observer.unobserve(entry.target);
		}
	  });
	}, { threshold: 0.5 }); // Ajusta el umbral según sea necesario
  
	// Observar todos los elementos con la clase '.counter-number'
	const counters = document.querySelectorAll('.counter-number');
	counters.forEach(counter => {
	  observer.observe(counter);
	});
  });
  
