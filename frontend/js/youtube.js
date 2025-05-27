document.addEventListener('DOMContentLoaded', function () {
    var videoModal = document.getElementById('videoModal');
    var youtubeVideo = document.getElementById('youtubeVideo');
    var videoSrc = "https://www.youtube.com/embed/hm5C2sV3f-U?modestbranding=1&rel=0"; // URL base sin autoplay
  
    videoModal.addEventListener('show.bs.modal', function () {
      youtubeVideo.src = videoSrc + "&autoplay=1"; // Añadir autoplay solo cuando el modal se abra
    });
  
    videoModal.addEventListener('hide.bs.modal', function () {
      youtubeVideo.src = ""; // Limpia el src para detener completamente el video
    });
  });
  