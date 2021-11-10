export default class SortableTable {
  element;
  subElements = {};
  headersConfig = [];
  data = [];

  onSortClick = (event) => {
    const clickedColumn = event.target.closest('[data-sortable="true"]');
    this.sorted.id = clickedColumn.dataset.id;
    if(!clickedColumn.dataset.order){
      this.sorted.order = 'asc';
    }
    else this.sorted.order = clickedColumn.dataset.order === 'asc' ? 'desc' : 'asc';
    this.sort(this.sorted);
     
  }

  constructor(headersConfig, {
    data = [],
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    }
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;

    this.render();
    this.sort(this.sorted);
  }

  getHeaderCell({id, title, sortable}){
    return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
                <span>${title}</span>
                  ${this.getHeaderSortingArrow(sortable)}             
            </div>
          `       
  }
  getHeaderSortingArrow(sortable){
    return sortable ? ` 
        <span class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>
      ` : 
     '';
  }


  getTableHeader(){
    return `<div data-elem="header" class="sortable-table__header sortable-table__row">
            ${this.headersConfig.map(item => this.getHeaderCell(item)).join('')}
            </div>
    `    
  }

  getTableCell(item){
    return `<div class="sortable-table__cell">${item}</div>`
  }

  getTableRow(item){   
    return `<a href="#" class="sortable-table__row">
              ${this.dataFields.map(({id, template}) => {
                  if(template) return template(item[id]);
                  else return this.getTableCell(item[id]);
              }).join('')}
            </a>
          `
  }

  getTableBody(data){
    this.dataFields = this.headersConfig.map(({id, template}) => {return {id, template};});
      return `<div data-elem="body" class="sortable-table__body">
          ${data.map(item => this.getTableRow(item)).join('')}  
          </div>
    `
  }

  getTable(data){
    return `<div class="sortable-table">
            ${this.getTableHeader()}
            ${this.getTableBody(data)}
            </div>
    `
  }

  getSubElements(element){
    const elements = element.querySelectorAll('[data-elem]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement;
          return accum;
    }, {});
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable(this.data);
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
  }


  initEventListeners () {
    this.subElements.header.addEventListener('click', this.onSortClick);
  }

  sort ({id, order}) {
    const sortedData = this.sortData(id, order);
    const allColumns = this.element.querySelectorAll(`.sortable-table__cell[data-id]`);
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`);

    // Remove sorting arrow from other columns
    allColumns.forEach(column => {
      if(column.dataset.id !== 'images')
      column.dataset.order = '';
    });

    currentColumn.dataset.order = order;
    
    this.subElements.body.innerHTML = sortedData.map(item => this.getTableRow(item)).join('');
 }

  sortData(id, order){
    const arrData = [...this.data];
    const column = this.headersConfig.find(item => item.id === id);
    const {sortType, customSorting} = column;
    const direction = order === 'asc' ? 1 : -1;

    return arrData.sort((a, b) => {
      switch(sortType){
        case 'number': return direction * (a[id] - b[id]);
        case 'string': return direction * a[id].localeCompare(b[id], 'ru');
        case 'custom': return direction * customSorting(a,b);
        default: return direction * (a[id] - b[id]);
      }
    })    
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
