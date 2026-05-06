let chartInstance = null;

export const atualizarGrafico = (dados) => {
    const ctx = document.getElementById('meuGrafico').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    
    const isLight = document.body.classList.contains('light');
    
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(dados),
            datasets: [{
                data: Object.values(dados),
                backgroundColor: ['#2563eb', '#ef4444', '#facc15', '#7c3aed', '#22c55e']
            }]
        },
        options: { 
            responsive: true,
            plugins: { 
                legend: { 
                    position: 'bottom', 
                    labels: { color: isLight ? '#000' : '#fff' } 
                } 
            } 
        }
    });
};