const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializar cliente de Supabase (configurar en .env)
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Importamos el cliente de zrenderer desde la carpeta de integración
// Soporta tanto ejecución local como en Docker (vía volúmenes)
const ZRendererClient = (() => {
    try {
        return require('../../../integration/node-client/zrenderer-client');
    } catch (e) {
        return require('../integration/node-client/zrenderer-client');
    }
})();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ZRENDERER_URL = process.env.ZRENDERER_URL || 'http://localhost:11011';
const ZRENDERER_TOKEN = process.env.ZRENDERER_TOKEN || 'test-token'; // Debería venir de accesstokens.conf

const renderer = new ZRendererClient(ZRENDERER_URL, ZRENDERER_TOKEN);

// Endpoint para obtener la configuración visual de un personaje
app.get('/api/character/:id', async (req, res) => {
    // Ejemplo de consulta a Supabase
    /*
    const { data: character, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error) return res.status(404).json({ error: 'Personaje no encontrado' });
    res.json(character);
    */

    // Retornamos un ejemplo estático por ahora
    res.json({
        id: req.params.id,
        name: 'Heroe de Prueba',
        visuals: {
            job: [4012], // Sniper
            gender: 1,
            head: 1,
            action: 0
        }
    });
});

// Proxy para el renderizador (opcional, si no quieres exponer el zrenderer directamente)
app.post('/api/render', async (req, res) => {
    try {
        const imageBuffer = await renderer.renderImage(req.body);
        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al renderizar sprite' });
    }
});

app.listen(port, () => {
    console.log(`Servidor RPG Táctico corriendo en http://localhost:${port}`);
});
