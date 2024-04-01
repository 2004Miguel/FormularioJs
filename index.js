let serialize = target =>
    Array.from(target.elements).reduce((acc, el) => {
        if (!el.name) return acc;
        acc[el.name] = el.value;
        return acc;
    }, {});

class User{
    /**
     * Las propiedades static son utilizadas para usar caracteristicas que pertenecen a la clase y no a una instancia específica de la clase. Estos elementos static no necesitan de una instancia para ser llamados, se usan desde la propia clase (class.elemento). https://keepcoding.io/blog/que-significa-static-en-javascript/#:~:text=La%20palabra%20static%20en%20Javascript%20se%20utiliza%20para%20definir%20propiedades,sin%20necesidad%20de%20crear%20objetos.
     */
    static #url ="https://jsonplaceholder.typicode.com/users";//Link de la API de prueba
    static #users = [];
    static #ul = document.createElement("ul");
    static #form = document.createElement("form");
    static #initialValues = {
        name: "", 
        email: "", 
    }

    constructor(data){
        this.name = data.name;
        this.email = data.email;

    }
    
    static async getAll(){//muestra el listado de usuarios de la api (ususarios que hay en el link)
        try{
            const response = await fetch(this.#url);
            if(!response.ok) throw response;
            this.#users = await response.json();
            return this.#users;

        }catch(e){
            console.log("Error ", e);
        }
    }

    static renderUser(u){
        let li = document.createElement("li");
        li.innerText = u.name;
        return li;

    }

    static render(){
        let users = this.#users;
        users.forEach(u => this.#ul.appendChild(this.renderUser(u)));
        return this.#ul;
    }

    static onsubmit(e){
        e.preventDefault();
        let data = serialize(e.target);
        let user = new User(data);
        const errors = user.validate();
        if(Object.keys(errors).length > 0){
            this.#form.innerHTML = this.formHTML({data, errors});
            return;
        }
        user.save();
    }

    save(){
        return User.save(this);//this es la instancia del usuario
    }

    static async save(user){
        try{
            const response = await fetch(this.#url, {
                method: "POST", 
                headers: {"Content-Type": "application/json"}, 
                body: JSON.stringify(user)
            });
            const data = await response.json();
            this.#users.unshift(data);
            this.#ul.prepend(this.renderUser(data));

        }catch(e){
            console.log("Error", e);

        }
    }

    validate(){
        let errors = {};
        if(!this.name){
            errors.name = "Nombre es obligatorio";
        }
        if(!this.email){
            errors.email = "El email es obligatorio";
        }

        return errors;
    }

    static formHTML({data, errors}){//template string¡?
        return `
        <form>
            <div>
                <label>Nombre:</label>
                <input name="name" value="${data.name}" />
                ${errors.name || ""}
            </div>
            <div>
                <label>Correo:</label>
                <input name="email" value="${data.email}" />
                ${errors.email || ""}
            </div>
            <input type="submit" value="Enviar" />
        </form>
        `

    }

    static renderForm(){
        this.#form.onsubmit = this.onsubmit.bind(this);//cambia el contexto de this
        this.#form.innerHTML = this.formHTML({
            data: this.#initialValues, 
            errors: {},
        });
        return this.#form;
    }
}

async function main(){
    const users = await User.getAll();
    const template = User.render();
    const form = User.renderForm();
    document.body.insertAdjacentElement("afterbegin", template);//el elemento template (que es la lista desorganizada html) se agrega después del inicio (justo después del body)
    document.body.insertAdjacentElement("afterbegin", form);
    
}

main();