export const highlightCode = (code: string, language: string) => {
  if (!language) {
    return <span className="text-white/90">{code}</span>;
  }

  const lines = code.split('\n');
  
  return lines.map((line, lineIndex) => (
    <div key={lineIndex} className="block">
      {highlightLine(line, language)}
      {lineIndex < lines.length - 1 && '\n'}
    </div>
  ));
};

const highlightLine = (line: string, language: string) => {
  const lowerLang = language.toLowerCase();
  
  if (lowerLang === 'python' || lowerLang === 'py') {
    return highlightPython(line);
  }
  
  if (lowerLang === 'javascript' || lowerLang === 'js' || lowerLang === 'typescript' || lowerLang === 'ts' || lowerLang === 'tsx' || lowerLang === 'jsx') {
    return highlightJavaScript(line);
  }
  
  if (lowerLang === 'go' || lowerLang === 'golang') {
    return highlightGo(line);
  }
  
  if (lowerLang === 'css' || lowerLang === 'scss' || lowerLang === 'sass') {
    return highlightCSS(line);
  }
  
  if (lowerLang === 'html' || lowerLang === 'xml') {
    return highlightHTML(line);
  }
  
  if (lowerLang === 'json') {
    return highlightJSON(line);
  }
  
  return <span className="text-white/90">{line}</span>;
};

const highlightPython = (line: string) => {
  const keywords = ['import', 'from', 'def', 'class', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'return', 'yield', 'break', 'continue', 'pass', 'lambda', 'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False'];
  const functions = ['print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple'];
  
  let result = line;
  
  result = result.replace(/(#.*$)/g, '<span class="text-gray-400">$1</span>');
  result = result.replace(/(".*?"|'.*?'|"""[\s\S]*?"""|'''[\s\S]*?''')/g, '<span class="text-green-400">$1</span>');
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    result = result.replace(regex, `<span class="text-purple-400">${keyword}</span>`);
  });
  
  functions.forEach(func => {
    const regex = new RegExp(`\\b${func}\\b(?=\\()`, 'g');
    result = result.replace(regex, `<span class="text-yellow-400">${func}</span>`);
  });
  
  result = result.replace(/\b\d+\.?\d*\b/g, '<span class="text-orange-400">$&</span>');
  
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

const highlightJavaScript = (line: string) => {
  const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'class', 'extends', 'import', 'export', 'from', 'default', 'async', 'await', 'typeof', 'instanceof'];
  const types = ['string', 'number', 'boolean', 'object', 'undefined', 'null', 'Array', 'Object', 'Promise'];
  
  let result = line;
  
  result = result.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-400">$1</span>');
  result = result.replace(/(`.*?`|".*?"|'.*?')/g, '<span class="text-green-400">$1</span>');
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    result = result.replace(regex, `<span class="text-purple-400">${keyword}</span>`);
  });
  
  types.forEach(type => {
    const regex = new RegExp(`\\b${type}\\b`, 'g');
    result = result.replace(regex, `<span class="text-blue-400">${type}</span>`);
  });
  
  result = result.replace(/\b\d+\.?\d*\b/g, '<span class="text-orange-400">$&</span>');
  result = result.replace(/(\w+)(?=\s*\()/g, '<span class="text-yellow-400">$1</span>');
  
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

const highlightGo = (line: string) => {
  const keywords = ['package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'return', 'go', 'defer', 'select', 'chan', 'map'];
  const types = ['int', 'int32', 'int64', 'uint', 'uint32', 'uint64', 'string', 'bool', 'byte', 'rune', 'float32', 'float64', 'error'];
  
  let result = line;
  
  result = result.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-400">$1</span>');
  result = result.replace(/(`.*?`|".*?")/g, '<span class="text-green-400">$1</span>');
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    result = result.replace(regex, `<span class="text-purple-400">${keyword}</span>`);
  });
  
  types.forEach(type => {
    const regex = new RegExp(`\\b${type}\\b`, 'g');
    result = result.replace(regex, `<span class="text-blue-400">${type}</span>`);
  });
  
  result = result.replace(/\b\d+\.?\d*\b/g, '<span class="text-orange-400">$&</span>');
  
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

const highlightCSS = (line: string) => {
  let result = line;
  
  result = result.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-400">$1</span>');
  result = result.replace(/([a-zA-Z-]+)(?=\s*:)/g, '<span class="text-blue-400">$1</span>');
  result = result.replace(/:(\s*[^;]+)/g, ': <span class="text-green-400">$1</span>');
  result = result.replace(/^(\s*[.#]?[\w-]+)/g, '<span class="text-yellow-400">$1</span>');
  
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

const highlightHTML = (line: string) => {
  let result = line;
  
  result = result.replace(/(<!--[\s\S]*?-->)/g, '<span class="text-gray-400">$1</span>');
  result = result.replace(/(<\/?)([\w-]+)/g, '$1<span class="text-blue-400">$2</span>');
  result = result.replace(/(\w+)=/g, '<span class="text-yellow-400">$1</span>=');
  result = result.replace(/="([^"]*)"/g, '="<span class="text-green-400">$1</span>"');
  
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

const highlightJSON = (line: string) => {
  let result = line;
  
  result = result.replace(/"([^"]*)":/g, '"<span class="text-blue-400">$1</span>":');
  result = result.replace(/:\s*"([^"]*)"/g, ': "<span class="text-green-400">$1</span>"');
  result = result.replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-orange-400">$1</span>');
  result = result.replace(/:\s*(true|false|null)/g, ': <span class="text-purple-400">$1</span>');
  
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};