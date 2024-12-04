const express = require('express');
const cors = require('cors');
const uuid = require('uuid');
const storage = require('./storage');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { Pie } = require('nivo');

const server = express();
server.use(express.json());
server.use(cors());

server.post('/chart', (req, res) => {
  const id = uuid.v4();
  const url = `${req.protocol}://${req.get('host')}/render/${id}`;

  storage.set(id, {
    props: {
      data: req.body.data,
    },
    url,
  });

  res.status(201).json({ id, url });
});

server.get('/render/:id', (req, res) => {
  const id = req.params.id;
  const config = storage.get(id);

  if (!config) {
    return res.status(404).send(`no chart found for id "${id}"`);
  }

  const rendered = renderToStaticMarkup(
    React.createElement(
      Pie,
      Object.assign(
        {
          animate: false,
          isInteractive: false,
          width: 800,
          height: 600,
          colors: config.props.data.map(item => item.color),
        },
        config.props
      )
    )
  );

  res.set('content-type', 'image/svg+xml').status(200).send(rendered);
});

server.listen(3001, () => {
  console.log('Server started on port 3001');
});
