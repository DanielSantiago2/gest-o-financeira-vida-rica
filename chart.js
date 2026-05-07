/*
//Transforma números em gráficos compreensíveis.
*/
let chartInstance = null; // Armazena o gráfico atual para poder destruí-lo antes de criar um novo

export const atualizarGrafico = (dados) => {
    const ctx = document.getElementById('meuGrafico').getContext('2d');

    // IMPORTANTE: Se já existe um gráfico, precisamos "matar" ele antes de desenhar o novo
    if (chartInstance) chartInstance.destroy();
    
    const isLight = document.body.classList.contains('light');
    
    chartInstance = new Chart(ctx, {
        type: 'doughnut', // Gráfico estilo rosca
        data: {
            labels: Object.keys(dados), // Nomes das categorias
            datasets: [{
                data: Object.values(dados), // Valores das categorias
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