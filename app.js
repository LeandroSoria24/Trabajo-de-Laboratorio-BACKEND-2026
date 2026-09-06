import express from "express";
const app = express();
const PORT = 3000;
app.use(express.json());

const eventos = ([
    {
        id: 1,
        nombre: 'Congreso de Tecnología',
        lugar: 'Auditorio Principal'
    },
    {
        id: 2,
        nombre: 'Workshop de Node.js',
        lugar: 'Laboratorio de Informática'
    }
])

/* no se usa porque es mas normal recibir(get) un formato JSON */
/* app.get('/',(req,res)=>{
    res.send('bienvenido al servidor de Leandro')
});
 */


/* GETTERS */
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Api Laboratorio',
        version: '1'
    });
})

app.get('/eventos', (req, res) => {
    res.json(eventos)
})

app.get('/eventos/filtrados', (req, res) => {
    const nombreRecibido = req.query.nombre
    const eventoFiltrado = eventos.filter(evento => evento.nombre.includes(nombreRecibido)) //usamos filter (dar repaso)
    res.json(eventoFiltrado)
})

//ahora vamos a hacer un geter para eventos pero con un parametro de identificacion, preferentemten un id por supuesto
app.get('/eventos/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const evento = eventos.find(e => e.id === id)
    res.json(evento)
})



/* POST */
app.post('/eventos', (req, res) => {
    const NuevoEvento = {
        id: eventos.length + 1,
        nombre: req.body.nombre,
        lugar: req.body.lugar
    }
    eventos.push(NuevoEvento)
    res.status(201).json(NuevoEvento)
})


/* PUT */
//obviamente hay que filtrar por id primero
app.put('/eventos/:id', (req, res) => {
    const idEvento = parseInt(req.params.id)
    const Evento = eventos.find(e => e.id === idEvento)

    Evento.nombre = req.body.nombre
    Evento.lugar = req.body.lugar

    res.json(Evento)

})

/* DELETE */
app.delete('/eventos/:id', (req, res) => {
    const idEvento = parseInt(req.params.id)
    const indice = eventos.findIndex(e => e.id = idEvento)
    eventos.splice(indice, 1)

    res.status(204).send()
})


/* LISTEN */
app.listen(PORT, () => {
    console.log(`servidor iniciado en puerto ${PORT}`)
});