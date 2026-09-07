/* ModelQuest v9 interaction bridge for content rewritten after the base quest binds its handlers. */
(()=>{
  const official={
    1:'https://scikit-learn.org/stable/modules/linear_model.html#ordinary-least-squares',
    2:'https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression',
    3:'https://scikit-learn.org/stable/modules/neighbors.html',
    4:'https://scikit-learn.org/stable/modules/tree.html',
    5:'https://scikit-learn.org/stable/modules/ensemble.html',
    6:'https://scikit-learn.org/stable/modules/clustering.html#k-means',
    7:'https://keras.io/guides/sequential_model/',
    8:'https://scikit-learn.org/stable/common_pitfalls.html',
    9:'https://keras.io/api/layers/convolution_layers/convolution2d/',
    10:'https://keras.io/api/layers/recurrent_layers/lstm/',
    11:'https://huggingface.co/docs/transformers/index',
    12:'https://huggingface.co/docs/peft/index',
    13:'https://huggingface.co/docs/transformers/main/en/model_doc/rag'
  };
  function id(){const m=(document.querySelector('.v5-quest-title .v5-kicker')?.textContent||'').match(/MODEL\s+(\d+)/i);return m?+m[1]:0}
  document.addEventListener('click',e=>{
    const concept=e.target.closest('[data-concept]');
    if(concept&&window.MQ_OPEN_EXPLANATION){e.preventDefault();e.stopPropagation();window.MQ_OPEN_EXPLANATION(concept.dataset.concept);return}
    const src=e.target.closest('#v5Official');
    if(src){e.preventDefault();const u=official[id()];if(u)window.open(u,'_blank','noopener');return}
    const done=e.target.closest('#v5MarkComplete');
    if(done){
      e.preventDefault();e.stopPropagation();
      const fields=[...document.querySelectorAll('[data-mq9-answer]')];
      const missing=fields.filter(x=>!x.value.trim());
      if(missing.length){missing[0].focus();missing.forEach(x=>x.classList.add('mq9-missing'));setTimeout(()=>missing.forEach(x=>x.classList.remove('mq9-missing')),1200);return}
      document.querySelector('#v5Next')?.click();
    }
  },true);
})();
