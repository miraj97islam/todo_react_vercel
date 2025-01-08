import './App.css';
import { useState, useEffect  } from 'react';

  function InputCompnent({onChangeTrigger, inputValue, elementType, className, placeholder}){

    if(elementType==='elementInput'){
      return <input onChange={onChangeTrigger} value={inputValue} className={className} placeholder = {placeholder}></input> 
    }else if(elementType==='elementTextArea'){
      return <textarea onChange={onChangeTrigger} value={inputValue} className={className} placeholder = {placeholder}></textarea> 
    }
}


function MapedComponents({todoList, inputType, triggers}){
   const tasksList = todoList.filter(task=> task.inputType === inputType);

  return(
   tasksList.map((task) => (
    <div  className='note-item'>
          <VisualizedNotes keyValue = {task.id} noteValue ={task.task} onClickTriger ={()=>triggers[0](task.id)} className = {'note-item-content'} />
          <DeleteButton onClickTriger={()=> triggers[1](task.id)} className={'btn-delete'} />
    </div> 
    ))
  )
}

function VisualizedNotes({keyValue, noteValue, onClickTriger, className}){
  return(
    <div key={keyValue}  onClick ={onClickTriger} className={className}>
        {noteValue} 
    </div>
  )
}

function Buttons({onClickTriger, className, btnTitle}){
  return (
        <button onClick={onClickTriger} className={className}>
                    {btnTitle}          
        </button>
  )
}

function DeleteButton({onClickTriger, className}){
  return (  
        <button onClick={onClickTriger}  className= {className}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
           class="size-4 lg:size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 
                1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 
                0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 
                0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 
                48.667 0 0 0-7.5 0" />
          </svg>
        </button>
  )
}

function App() { 
  
  const[newInput, setnewInput]  = useState("");
  const[todoList, setTodoList] = useState([]);
  const[editTaskId, setEditTaskId] = useState(null);
  const[inputType, setinputType] = useState("elementInput");

    useEffect(() => {
      // fetch('http://localhost:5000/todos')
      fetch('https://todo-backend-vercel-cyan.vercel.app/todos')
        .then(response => response.json())
        .then(data => setTodoList(data))
        .catch(error => console.error('Error fetching todos:', error));
    }, []);


    const addTodo = ()=>{ 

        if (!newInput.trim()){
          return
        }

        const newValue = {
          task: newInput,
          inputType: inputType,
        };
  

        if (editTaskId){
              fetch(`https://todo-backend-vercel-cyan.vercel.app/todos/${editTaskId}`, {
                mode: 'no-cors',
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(newValue),
              })
                .then(response => response.json())
                .then(updatedTodo => {
                  const updatedTodos = todoList.map(t =>
                    t.id === editTaskId ? updatedTodo : t
                  );
                  setTodoList(updatedTodos);
                  setnewInput('');
                  setEditTaskId(null);
                })
                .catch(error => console.error('Error updating todo:', error));
        }else{

              fetch('https://todo-backend-vercel-cyan.vercel.app/todos', {
                mode: 'no-cors',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(newValue),
              })
                .then(response => response.json())
                .then(newTodo => {
                  setTodoList([...todoList, newTodo]);
                  setnewInput('');
                })
                .catch(error => console.error('Error adding todo:', error));
        }    
  }

  function visualizeToUpdate(id){
      
       fetch(`https://todo-backend-vercel-cyan.vercel.app/todos/${id}`)
        .then(response => response.json())
        .then(data => setnewInput(data.task))
        .then(setEditTaskId(id))
        .catch(error => console.error('Error fetching todos:', error));

  }


  function deleteTodo(id){

        fetch(`https://todo-backend-vercel-cyan.vercel.app/todos/${id}`, {
          mode: 'no-cors',
          method: 'DELETE',
        })
          .then(() => {
            const updatedTodos = todoList.filter(task => task.id !== id);
            setTodoList(updatedTodos);
            setnewInput("");
            setEditTaskId(null);
          })
          .catch(error => console.error('Error deleting todo:', error));
  }


  function currentTodo(e){
        setnewInput(e.target.value);
  }
  

  function handleTabs(typeOfInput){

        setinputType(typeOfInput);
        setnewInput("");
        setEditTaskId(null);

    }


  return (
    <>
      <div className='container'>

        <div className='notepad-container'>
            <div className='title'>
                  Google Keep
            </div>
            <div>
                <InputCompnent onChangeTrigger={currentTodo} inputValue={newInput}  elementType={inputType} className={inputType} placeholder={'Add your task..'} />
            </div>
            <div>
                <Buttons onClickTriger={addTodo} className={'btn-save'} btnTitle={'Save'}/>
            </div>
        </div>

         <div className='tab-buttons'>
                <button onClick={()=>handleTabs('elementInput')} id="btn-task" 
                    className={`'btn-tasks' ${inputType==='elementInput'? 'tab-btn-underline' : ''}`}>My Tasks</button>
                <button onClick={()=>handleTabs('elementTextArea')} id="btn-note" 
                    className={`'btn-notes' ${inputType==='elementTextArea'? 'tab-btn-underline' : ''}`}>My Notes</button>
        </div>
          <MapedComponents todoList={todoList} inputType={inputType} triggers={[visualizeToUpdate,deleteTodo]}/>
        </div>
    </>
  );
}

export default App;
