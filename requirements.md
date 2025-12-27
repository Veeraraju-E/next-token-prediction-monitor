# Next Token Prediction Monitor
I need to build a very simplistic website with the following requirements: 
1. The main motive of this website is to monitor the next-token-prediction probability distributions of LLMs 
2. It should run an LLM in the background (which could be interfaced via HF). Assume that I work on a remote GPU server. This is an important step - I should be able to load custom models. E.g., if I modify a particular layer's weights and store the .pt files, then I should be able to load and use this new model too. 
3. The UI needs to be clear, crisp, not choppy, and very much like Anthropic's websites. 
4. Once the model is loaded, there should be a text field and a graphics card at the bottom. The text field should have two modes - one for editing, and one for monitoring. I.e., 
    1. In the editing mode, I should be able to type words, that get neatly demarcated as tokens (using the model's tokenizer), and parallelly updates the infographic with the probability distribution for the next token (not yet typed
    2. In the monitor mode, I should be able to hover over all existing tokens in the text field and it should show me the probability distribution (obv, the conditional one, since tokens to the left already exist) over the vocabulary, in the graphic card below it. 
5. All of this should happen fast - assume that I would be mostly using models that are <1.5B in size.