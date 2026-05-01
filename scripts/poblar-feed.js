require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PEXELS_KEY = 'eV5PNXVGqK3jrz6phBgfL07HIF5Q50zmpnOxwj8BBLL8oxKiMM4fOt3b';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function poblarConLoQueHay() {
    console.log('🚀 Iniciando carga usando solo columnas existentes...');

    try {
        const res = await axios.get('https://api.pexels.com/videos/search?query=modern+house&per_page=5', {
            headers: { 'Authorization': PEXELS_KEY.trim() }
        });

        const videos = res.data.videos;
        console.log(`✅ Obtenidos ${videos.length} videos de Pexels.`);

        for (const v of videos) {
            const linkVideo = v.video_files.find(f => f.width >= 720)?.link || v.video_files[0].link;

            // SOLO usamos las columnas que veo en tu captura: video_url, price, description...
            const { error } = await supabase.from('properties').insert([{
                title: 'Casa Moderna Demo',
                description: 'Propiedad de prueba cargada automáticamente.',
                video_url: linkVideo, // Esta columna SÍ está en tu foto
                price: 150000,
                currency: 'USD',
                province: 'Buenos Aires',
                status: 'active',
                user_id: '00565c5d-f881-48f4-88dc-d2ee74df9412' // Asegurate que este ID de usuario sea real
            }]);

            if (error) {
                console.error('❌ Error al insertar:', error.message);
            } else {
                console.log('✅ Video insertado con éxito en video_url');
            }
        }
    } catch (err) {
        console.error('❌ Error general:', err.message);
    }
}

poblarConLoQueHay();