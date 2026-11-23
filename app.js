const starter = `# A quieter place to write\n\nWelcome to **Paperlane**, a small markdown studio designed to stay out of your way. Your work is saved automatically in this browser.\n\n## Made for thinking\n\nUse the toolbar to add structure, or write markdown directly. Choose a typeface that feels right, and watch the reading view update as you go.\n\n> Good writing begins when the tools disappear.\n\n### A few useful things\n\n- Clean, focused writing space\n- Live rendered preview\n- Export when you're ready\n\n| Shortcut | What it does |\n| --- | --- |\n| Cmd / Ctrl + N | New document |\n| Cmd / Ctrl + S | Download Markdown |\n\n[Learn markdown](https://www.markdownguide.org/basic-syntax/)`;
const editor = document.querySelector('#editor'), preview = document.querySelector('#preview'), previewPane = document.querySelector('.preview-pane'), nameEl = document.querySelector('#documentName'), statusEl = document.querySelector('#saveStatus'), list = document.querySelector('#documentList'), fileInput = document.querySelector('#fileInput'), sidebar = document.querySelector('#sidebar'), sidebarToggle = document.querySelector('#sidebarToggle'), sidebarScrim = document.querySelector('#sidebarScrim'), closeLibraryButton = document.querySelector('#closeLibrary'), mobileViewToggle = document.querySelector('#mobileViewToggle'), fontChoice = document.querySelector('#fontChoice');
let docs = JSON.parse(localStorage.getItem('paperlane-documents') || '[]');
let activeId = localStorage.getItem('paperlane-active');
if (!docs.length) { activeId = crypto.randomUUID(); docs = [{id: activeId, content: starter, updated: Date.now()}]; }
if (!docs.some(d => d.id === activeId)) activeId = docs[0].id;
const active = () => docs.find(d => d.id === activeId);

// Font system configuration
const fonts = {
  literata: 'Literata, Georgia, serif',
  calibri: 'Calibri, Candara, sans-serif',
  helvetica: 'Helvetica, Arial, sans-serif',
  mono: '"DM Mono", monospace'
};

// Font selector state
let fontState = {
  editor: localStorage.getItem('paperlane-font') || 'literata',
  preview: localStorage.getItem('paperlane-font') || 'literata'
};
const titleFrom = content => (content.match(/^\s*#\s+(.+)/m)?.[1] || content.split('\n').find(l => l.trim()) || 'Untitled note').replace(/[#*_`]/g, '').trim().slice(0, 52);
marked.use({gfm:true, breaks:true});
// Font selector initialization
function initializeFontSelector() {
  // Set initial font values from state
  editor.style.fontFamily = fonts[fontState.editor];
  preview.style.setProperty('--preview-font', fonts[fontState.preview]);
  
  // Update font choice dropdown to reflect current selection
  fontChoice.value = fontState.editor;
}

// Enhanced font change handler with visual feedback
function changeFont(fontKey, element, isPreview = false) {
  if (!fonts[fontKey]) return;
  
  // Update font state
  if (isPreview) {
    fontState.preview = fontKey;
    preview.style.setProperty('--preview-font', fonts[fontKey]);
  } else {
    fontState.editor = fontKey;
    editor.style.fontFamily = fonts[fontKey];
  }
  
  // Save to localStorage
  localStorage.setItem('paperlane-font', fontKey);
  
  // Show visual feedback
  showFontChangeFeedback(fontKey, isPreview);
}

// Visual feedback for font changes
function showFontChangeFeedback(fontKey, isPreview) {
  const feedback = document.createElement('div');
  feedback.className = 'font-change-feedback';
  feedback.textContent = fonts[fontKey].split(',')[0];
  feedback.style.position = 'fixed';
  feedback.style.bottom = '30px';
  feedback.style.left = '50%';
  feedback.style.transform = 'translateX(-50%)';
  feedback.style.background = 'rgba(41, 43, 65, 0.9)';
  feedback.style.color = 'white';
  feedback.style.padding = '8px 16px';
  feedback.style.borderRadius = '8px';
  feedback.style.fontSize = '12px';
  feedback.style.fontFamily = fonts[fontKey];
  feedback.style.zIndex = '1000';
  feedback.style.opacity = '0';
  feedback.style.transition = 'opacity 0.3s ease';
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.style.opacity = '1';
  }, 10);
  
  setTimeout(() => {
    feedback.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(feedback);
    }, 300);
  }, 1500);
}

function render(){ const doc=active(); if(!doc){editor.value='';preview.innerHTML='';nameEl.textContent='No document selected';statusEl.textContent='Create or open a file';document.querySelector('#wordCount').textContent='0 words';renderList();return} editor.value=doc.content; updatePreview(); renderList(); }
function updatePreview(){ const doc=active(); if(!doc)return; doc.content=editor.value; const title=titleFrom(doc.content); nameEl.textContent=title; document.title=`${title} — Paperlane`; preview.innerHTML=DOMPurify.sanitize(marked.parse(doc.content)); document.querySelector('#wordCount').textContent=`${(doc.content.trim().match(/\S+/g)||[]).length} words`; saveSoon(); }
function persist(){localStorage.setItem('paperlane-documents',JSON.stringify(docs));if(activeId)localStorage.setItem('paperlane-active',activeId);else localStorage.removeItem('paperlane-active')}
let saveTimer; function saveSoon(){ if(!active())return; statusEl.textContent='Saving…'; clearTimeout(saveTimer); saveTimer=setTimeout(()=>{const doc=active();if(!doc)return;doc.updated=Date.now();persist();statusEl.textContent='All changes saved';renderList()},300); }
function closeLibrary(){sidebar.classList.remove('open');document.body.classList.remove('library-open');sidebarToggle.setAttribute('aria-expanded','false')}
function renderList(){ list.innerHTML=''; [...docs].sort((a,b)=>b.updated-a.updated).forEach(doc=>{const row=document.createElement('div'),b=document.createElement('button'),remove=document.createElement('button'),title=document.createElement('span');row.className='doc-row';b.className=`doc-item ${doc.id===activeId?'active':''}`;b.type='button';title.textContent=titleFrom(doc.content);b.append(title);b.onclick=()=>{activeId=doc.id;persist();render();if(matchMedia('(max-width: 780px)').matches)closeLibrary()};remove.className='delete-doc';remove.type='button';remove.title=`Delete ${titleFrom(doc.content)}`;remove.setAttribute('aria-label',remove.title);remove.textContent='×';remove.onclick=()=>deleteDocument(doc.id);row.append(b,remove);list.append(row)}) }
function deleteDocument(id){const doc=docs.find(item=>item.id===id);if(!doc)return;const label=titleFrom(doc.content);docs=docs.filter(item=>item.id!==id);if(activeId===id)activeId=docs.sort((a,b)=>b.updated-a.updated)[0]?.id||null;persist();render();toast(`Deleted ${label}`)}
function selectWrap(before,after='',fallback='text'){const s=editor.selectionStart,e=editor.selectionEnd,text=editor.value.slice(s,e)||fallback;editor.setRangeText(before+text+after,s,e,'select');editor.selectionStart=s+before.length;editor.selectionEnd=s+before.length+text.length;editor.focus();updatePreview()}
const linePrefix = prefix => {const s=editor.selectionStart,e=editor.selectionEnd,start=editor.value.lastIndexOf('\n',s-1)+1,end=editor.value.indexOf('\n',e);const stop=end<0?editor.value.length:end;const lines=editor.value.slice(start,stop).split('\n').map(x=>prefix+x).join('\n');editor.setRangeText(lines,start,stop,'select');editor.focus();updatePreview()};
document.querySelectorAll('[data-command]').forEach(b=>b.onclick=()=>{const c=b.dataset.command;if(c==='bold')selectWrap('**','**');if(c==='italic')selectWrap('_','_');if(c==='code')selectWrap('`','`');if(c==='link')selectWrap('[','](https://)');if(c==='image')selectWrap('![','](https://images.unsplash.com/photo-1516979187457-637abb4f9353)');if(c==='ul')linePrefix('- ');if(c==='ol')linePrefix('1. ');if(c==='task')linePrefix('- [ ] ');if(c==='table')selectWrap('\n| Column one | Column two |\n| --- | --- |\n| Text | Text |\n','','');});
document.querySelector('#blockStyle').onchange=e=>{const v=e.target.value;if(v==='p')return;if(v==='quote')linePrefix('> ');else linePrefix('#'.repeat(+v[1])+' ');e.target.value='p'};
const previewFontChoice=document.querySelector('#previewFontChoice');
function applyFont(fontKey,showFeedback){if(!fonts[fontKey])return;fontState.editor=fontKey;fontState.preview=fontKey;editor.style.fontFamily=fonts[fontKey];preview.style.setProperty('--preview-font',fonts[fontKey]);localStorage.setItem('paperlane-font',fontKey);fontChoice.value=fontKey;previewFontChoice.value=fontKey;if(showFeedback)showFontChangeFeedback(fontKey,false)}
fontChoice.onchange=e=>applyFont(e.target.value);
previewFontChoice.onchange=e=>applyFont(e.target.value);
document.querySelector('#fontSyncBtn').onclick=()=>applyFont(fontChoice.value);
applyFont(localStorage.getItem('paperlane-font')||'literata',false);
document.querySelector('#newFile').onclick=()=>{activeId=crypto.randomUUID();docs.unshift({id:activeId,content:'# Untitled note\n\n',updated:Date.now()});render();if(matchMedia('(max-width: 780px)').matches){closeLibrary();setMobilePane('editor')}editor.focus();};
document.querySelector('#openFile').onclick=()=>fileInput.click();fileInput.onchange=async e=>{const f=e.target.files[0];if(!f)return;activeId=crypto.randomUUID();docs.unshift({id:activeId,content:await f.text(),updated:Date.now()});render();toast('Opened '+f.name);e.target.value=''};
document.querySelector('#exportMenu').onclick=()=>{const popover=document.querySelector('#exportPopover'),isOpen=popover.classList.toggle('open');document.querySelector('#exportMenu').setAttribute('aria-expanded',String(isOpen))};document.addEventListener('click',e=>{if(!e.target.closest('.export-wrap')){document.querySelector('#exportPopover').classList.remove('open');document.querySelector('#exportMenu').setAttribute('aria-expanded','false')}});
function download(blob,filename){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function safeName(){return titleFrom(active().content).replace(/[<>:"/\\|?*]+/g,'-')||'document'}
function crc32(str){let c=~0;for(let i=0;i<str.length;i++){c^=str.charCodeAt(i);for(let j=0;j<8;j++)c=c>>>1^((c&1)?0xEDB88320:0)}return(~c)>>>0}
function epub(){const title=titleFrom(active().content),body=DOMPurify.sanitize(marked.parse(active().content));const files=[['mimetype','application/epub+zip'],['META-INF/container.xml','<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],['OEBPS/content.opf',`<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book">paperlane-${Date.now()}</dc:identifier><dc:title>${title}</dc:title><dc:language>en</dc:language></metadata><manifest><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="chapter"/></spine></package>`],['OEBPS/chapter.xhtml',`<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title></head><body>${body}</body></html>`]];let parts=[],offset=0,central=[];const bytes=s=>new TextEncoder().encode(s),u16=n=>new Uint8Array([n&255,n>>>8&255]),u32=n=>new Uint8Array([n&255,n>>>8&255,n>>>16&255,n>>>24&255]);for(const [name,data]of files){let n=bytes(name),d=bytes(data),crc=crc32(data),local=[u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(d.length),u32(d.length),u16(n.length),u16(0),n,d];parts.push(...local);central.push(u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(d.length),u32(d.length),u16(n.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),n);offset+=local.reduce((x,y)=>x+y.length,0)}let size=central.reduce((x,y)=>x+y.length,0);parts.push(...central,u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(size),u32(offset),u16(0));download(new Blob(parts,{type:'application/epub+zip'}),safeName()+'.epub')}
document.querySelectorAll('[data-export]').forEach(b=>b.onclick=()=>{if(!active())return;const type=b.dataset.export,labels={md:'Markdown',pdf:'PDF',epub:'EPUB'};if(type==='md')download(new Blob([active().content],{type:'text/markdown'}),safeName()+'.md');if(type==='pdf'){document.body.classList.add('printing');window.print();setTimeout(()=>document.body.classList.remove('printing'),500)}if(type==='epub')epub();document.querySelector('#exportPopover').classList.remove('open');toast(`Exported to ${labels[type]}`)});
function toast(message){const t=document.querySelector('#toast');t.textContent=message;t.classList.add('visible');setTimeout(()=>t.classList.remove('visible'),2200)}
let lastPreviewDirection=1,previewPress;
const isPreviewControl=target=>target.closest('a,button,input,select,textarea,summary,[contenteditable="true"]');
function hasPreviewSelection(){const selection=window.getSelection();return selection&&!selection.isCollapsed&&(previewPane.contains(selection.anchorNode)||previewPane.contains(selection.focusNode))}
function pagePreview(direction){lastPreviewDirection=direction;const paneCanScroll=previewPane.scrollHeight>previewPane.clientHeight+1;const scroller=paneCanScroll?previewPane:document.scrollingElement;const viewportHeight=paneCanScroll?previewPane.clientHeight:window.innerHeight;const distance=viewportHeight*.93;const options={top:distance*direction,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'};if(scroller===document.scrollingElement)window.scrollBy(options);else scroller.scrollBy(options)}
previewPane.addEventListener('pointerdown',event=>{if(!event.isPrimary||event.button!==0||isPreviewControl(event.target))return;previewPress={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false}});
previewPane.addEventListener('pointermove',event=>{if(!previewPress||event.pointerId!==previewPress.id)return;if(Math.hypot(event.clientX-previewPress.x,event.clientY-previewPress.y)>12)previewPress.moved=true});
previewPane.addEventListener('pointercancel',()=>{previewPress=null});
previewPane.addEventListener('pointerup',event=>{const press=previewPress;previewPress=null;if(!press||event.pointerId!==press.id||press.moved||isPreviewControl(event.target)||hasPreviewSelection())return;const bounds=previewPane.getBoundingClientRect();pagePreview(event.clientX<bounds.left+bounds.width/2?-1:1)});
previewPane.addEventListener('keydown',event=>{if(event.target!==previewPane)return;const direction=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:event.key==='Enter'?lastPreviewDirection:0;if(!direction)return;event.preventDefault();pagePreview(direction)});
function setMobilePane(pane){const showingPreview=pane==='preview';document.body.classList.toggle('mobile-preview',showingPreview);mobileViewToggle.setAttribute('aria-pressed',String(showingPreview));const label=showingPreview?'Show editor':'Show preview';mobileViewToggle.setAttribute('aria-label',label);mobileViewToggle.title=label;mobileViewToggle.querySelector('.sr-only').textContent=label;localStorage.setItem('paperlane-mobile-pane',pane)}
document.querySelector('#focusMode').onclick=()=>document.body.classList.toggle('focus');sidebarToggle.onclick=()=>{if(matchMedia('(max-width: 780px)').matches){const opening=!sidebar.classList.contains('open');sidebar.classList.toggle('open',opening);document.body.classList.toggle('library-open',opening);sidebarToggle.setAttribute('aria-expanded',String(opening))}else{sidebar.classList.toggle('collapsed');const expanded=!sidebar.classList.contains('collapsed');sidebarToggle.setAttribute('aria-expanded',expanded);sidebarToggle.setAttribute('aria-label',expanded?'Collapse file library':'Expand file library');sidebarToggle.title=sidebarToggle.getAttribute('aria-label')}};sidebarScrim.onclick=closeLibrary;closeLibraryButton.onclick=closeLibrary;mobileViewToggle.onclick=()=>setMobilePane(document.body.classList.contains('mobile-preview')?'editor':'preview');setMobilePane(localStorage.getItem('paperlane-mobile-pane')||'editor');editor.addEventListener('input',updatePreview);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sidebar.classList.contains('open'))closeLibrary();if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='n'){e.preventDefault();document.querySelector('#newFile').click()}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='s'){e.preventDefault();document.querySelector('[data-export="md"]').click()}});render();
