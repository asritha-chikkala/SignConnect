document.addEventListener('DOMContentLoaded', () => {
  const iframe = document.getElementById('iframe');
  const loading = document.getElementById('loading');

  iframe.addEventListener('load', () => {
    loading.style.display = 'none';
    iframe.style.display = 'block';
  });

  setTimeout(() => {
    if (loading.style.display !== 'none') {
      loading.style.display = 'none';
      iframe.style.display = 'block';
    }
  }, 5000);
});