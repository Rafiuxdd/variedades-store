const DEFAULT_DELIVERY_RATES = {
  Acajutla: 4,
  Armenia: 4,
  Caluco: 3,
  Cuisnahuat: 5,
  Izalco: 3,
  Juayua: 5,
  Nahuizalco: 3.5,
  Nahulingo: 2.5,
  Salcoatitan: 5,
  "San Antonio del Monte": 2.5,
  "San Julian": 4,
  "Santa Catarina Masahuat": 5,
  "Santa Isabel Ishuatan": 6,
  "Santo Domingo de Guzman": 6,
  Sonsonate: 2,
  Sonzacate: 2
};

const SONSONATE_MUNICIPALITIES = Object.keys(DEFAULT_DELIVERY_RATES);

module.exports = {
  DEFAULT_DELIVERY_RATES,
  SONSONATE_MUNICIPALITIES
};
