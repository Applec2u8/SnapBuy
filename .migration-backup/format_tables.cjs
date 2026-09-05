const fs = require('fs');

const files = [
  'src/pages/Admin/views/ActivityLogs/ActivityLogManagement.tsx',
  'src/pages/Admin/views/OPUsers/OPUserManagement.tsx',
  'src/pages/Admin/views/Payments/PaymentManagement.tsx',
  'src/pages/Admin/views/StoreQuotas/StoreQuotas.tsx',
  'src/pages/Admin/views/Wallets/WalletManagement.tsx',
  'src/pages/Admin/views/Users/UserManagement.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace <table className="w-full text-left..."> with <table className="w-full text-left... responsive-table">
  content = content.replace(/<table className="([^"]*?w-full[^"]*?)"/g, (match, classes) => {
    if (!classes.includes('responsive-table')) {
      return `<table className="${classes} responsive-table"`;
    }
    return match;
  });

  // Extract the headers for each table.
  const tableRegex = /<table[\s\S]*?<\/table>/g;
  content = content.replace(tableRegex, (tableHtml) => {
    const theadMatch = tableHtml.match(/<thead[\s\S]*?<\/thead>/);
    if (!theadMatch) return tableHtml;
    
    const thMatches = [...theadMatch[0].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)];
    const headers = thMatches.map(m => {
      let text = m[1].replace(/<[^>]*>/g, '').trim(); 
      const tMatch = text.match(/t\('([^']+)'\)/);
      if (tMatch) return tMatch[1].replace('admin_', '').replace(/_/g, ' ');
      return text;
    });

    if (theadMatch[0].includes('.map(')) return tableHtml;

    let tbodyMatch = tableHtml.match(/<tbody[\s\S]*?<\/tbody>/);
    if (!tbodyMatch) return tableHtml;

    let tbodyHtml = tbodyMatch[0];
    let trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    tbodyHtml = tbodyHtml.replace(trRegex, (trHtml, trInner) => {
      let tdIndex = 0;
      let newTrInner = trInner.replace(/<td([^>]*)>/g, (tdMatch, tdAttrs) => {
        const header = headers[tdIndex] || '';
        tdIndex++;
        if (!tdAttrs.includes('data-label')) {
          return `<td${tdAttrs} data-label="${header.replace(/"/g, '&quot;')}">`;
        }
        return tdMatch;
      });
      return trHtml.replace(trInner, newTrInner);
    });

    return tableHtml.replace(tbodyMatch[0], tbodyHtml);
  });

  fs.writeFileSync(file, content, 'utf8');
  console.log('Processed', file);
});
