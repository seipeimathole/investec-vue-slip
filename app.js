const app = Vue.createApp({
  data() {
    return {
      promoBox: { one:{}, two:{}, three:{}},
      isError: false,
      robotStyles: {
        marginTop: '0px'
      },
      documentReady: {
         display: 'none'

      },
      showSpinner: false,
      errorMessage: '',
      searchvalue: '',
      slips: {},
    }
  },
  mounted() {
     this.randomSearch();
     this.promoBoxSearch(1);
     this.handleDocumentReady();
  },
  methods: {
    searchText(event) {
      this.searchvalue = event.target.value;
      console.log('searchValue', this.searchValue);
    },

    handleDocumentReady() {
      this.documentReady.display ='block'
    },

    handleResponse(response) {
      if (response.hasOwnProperty('slips')) { // Search
        this.slips = response.slips[0];
        this.isError = false;
      }

      if (response.hasOwnProperty('slip')) {  // Random Search
        this.slips = response.slip;
        this.isError = false;
      }
      if (response.hasOwnProperty('message')) {    // No slip(s)
         this.errorMessage = response.message.text;
         this.isError = true;
      }
      if(response instanceof Error) {  // system error
        this.errorMessage = response.message;
        this.isError = true;
      }
    },

    handlePromoBox(num, response) {
      response =  JSON.parse(response + '}')
      if(num == 1) {
        this.promoBox.one = response.slip.advice;
        this.promoBoxSearch(2);
      }
      if(num == 2) {
        this.promoBox.two = response.slip.advice;
        this.promoBoxSearch(3);
     
      }
      if(num == 3) {
        this.promoBox.three = response.slip.advice;
      }
    },

    search() { 
       if(this.searchValue !== ' ' || this.searchValue !== 'undefined' || this.searchValue !== null) {  
        this.showSpinner = true;
        this.moveRobot('up');    // Move robot up
        axios
        .get('https://api.adviceslip.com/advice/search/'+ this.searchvalue)
        .then(response => {
          this.showSpinner = false;
          this.handleResponse(response.data)
          setTimeout(() => this.moveRobot('down') , 1000); // Move robot down
          if (!response.data.hasOwnProperty('message')) {    // if no message, run promo
               this.promoBoxSearch(1);
          }
        })
        .catch(error => {
          this.showSpinner = false;
          this.handleResponse(error)
          setTimeout(() => this.moveRobot('down'), 1000); // Move robot down
        })
       }
    },

    randomSearch() {
      this.showSpinner = true;
      this.reset();  // clear search field when you do random search
      this.moveRobot('up')   // Move robot up
      axios
      .get('https://api.adviceslip.com/advice')
      .then(response => {
        this.showSpinner = false;
        this.handleResponse(response.data)
        setTimeout(() => this.moveRobot('down') , 1000); // Move robot down
        this.promoBoxSearch(1);
      })
      .catch(error => {
        this.showSpinner = false;
        this.handleResponse(error)
        setTimeout(() => this.moveRobot('down'), 1000);   // Move robot down
      })
    },

    moveRobot(direction) {
      if ( direction == 'up' ) {
        this.robotStyles.marginTop = '-400px'
      } else {
        this.robotStyles.marginTop = '0px'
      }
    },
    
    promoBoxSearch(num) {
      this.showSpinner = true;
      axios
      .get('https://api.adviceslip.com/advice/' + (Math.floor(Math.random() * 20) + 1)) 
      .then(response => {
        this.showSpinner = false;
        this.isError = false;
        this.handlePromoBox(num, response.data);
      })
      .catch(error => {
        this.showSpinner = false;
        this.isError = true;
        this.handlePromoBox(error);
      })
    },

    reset() {
      this.searchvalue = '';
    },
  }
});

app.mount('#app');
