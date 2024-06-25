import React, { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, FlipHorizontal, Star } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Room shape components
const Square = () => <div className="w-40 h-40 border-2 border-gray-400" />;
const Rectangle = () => <div className="w-60 h-40 border-2 border-gray-400" />;
const LShape = () => (
  <div className="relative w-60 h-60">
    <div className="absolute top-0 left-0 w-40 h-60 border-2 border-gray-400" />
    <div className="absolute bottom-0 right-0 w-20 h-40 border-2 border-gray-400" />
  </div>
);

// Draggable item component
const DraggableItem = ({ type, children }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}>
      {children}
    </div>
  );
};

// Room component with drop zone
const Room = ({ onDrop, children }) => {
  const [, drop] = useDrop(() => ({
    accept: ['door', 'window', 'furniture'],
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      onDrop(item.type, { x: offset.x, y: offset.y });
    },
  }));

  return (
    <div ref={drop} className="relative w-full h-64 border-2 border-gray-300">
      {children}
    </div>
  );
};

const FengShuiModern = () => {
  const [step, setStep] = useState(1);
  const [roomType, setRoomType] = useState(null);
  const [items, setItems] = useState([]);
  const [showBusynessPopup, setShowBusynessPopup] = useState(null);

  const handleRoomTypeSelect = (type) => {
    setRoomType(type);
  };

  const handleNextStep = () => {
    setStep(prevStep => Math.min(prevStep + 1, 3));
  };

  const handlePreviousStep = () => {
    setStep(prevStep => Math.max(prevStep - 1, 1));
  };

  const handleDrop = useCallback((type, position) => {
    const newItem = { id: Date.now(), type, position, rotation: 0, busyness: 0 };
    setItems(prevItems => [...prevItems, newItem]);
    if (type === 'door' || type === 'window') {
      setShowBusynessPopup(newItem.id);
    }
  }, []);

  const handleBusynessRate = (itemId, rating) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, busyness: rating } : item
      )
    );
    setShowBusynessPopup(null);
  };

  const handleRotate = (itemId) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, rotation: (item.rotation + 90) % 360 } : item
      )
    );
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl mb-4">Pick your Room Type!</h2>
            <div className="flex justify-center space-x-4 mb-4">
              <button onClick={() => handleRoomTypeSelect('square')} className="bg-red-200 p-4 rounded">Square</button>
              <button onClick={() => handleRoomTypeSelect('rectangle')} className="bg-red-200 p-4 rounded">Rectangle</button>
              <button onClick={() => handleRoomTypeSelect('l-shape')} className="bg-red-200 p-4 rounded">L-Shape</button>
            </div>
            {roomType && (
              <div className="border-2 border-gray-300 p-4 mb-4 flex justify-center">
                {roomType === 'square' && <Square />}
                {roomType === 'rectangle' && <Rectangle />}
                {roomType === 'l-shape' && <LShape />}
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button className="bg-gray-200 px-4 py-2 rounded"><FlipHorizontal /></button>
              <button className="bg-gray-200 px-4 py-2 rounded"><RotateCw /></button>
              <button className="bg-gray-200 px-4 py-2 rounded">Adjust Length</button>
            </div>
          </div>
        );
      case 2:
        return (
          <DndProvider backend={HTML5Backend}>
            <div>
              <h2 className="text-2xl mb-4">Place Doors & Windows</h2>
              <Room onDrop={handleDrop}>
                {items.map(item => (
                  <div key={item.id} style={{
                    position: 'absolute',
                    left: item.position.x,
                    top: item.position.y,
                    transform: `rotate(${item.rotation}deg)`,
                  }}>
                    {item.type === 'door' && <div className="w-8 h-1 bg-brown-500" />}
                    {item.type === 'window' && <div className="w-8 h-1 bg-blue-500" />}
                    {item.busyness > 0 && (
                      <div className="absolute top-4 left-0">
                        {[...Array(item.busyness)].map((_, i) => (
                          <Star key={i} className="inline text-yellow-400" size={12} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </Room>
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-4">
                  <DraggableItem type="window">
                    <button className="bg-blue-200 px-4 py-2 rounded">Window</button>
                  </DraggableItem>
                  <DraggableItem type="door">
                    <button className="bg-green-200 px-4 py-2 rounded">Door</button>
                  </DraggableItem>
                </div>
              </div>
            </div>
          </DndProvider>
        );
      case 3:
        return (
          <DndProvider backend={HTML5Backend}>
            <div>
              <h2 className="text-2xl mb-4">Place Furni</h2>
              <Room onDrop={handleDrop}>
                {items.map(item => (
                  <div key={item.id} style={{
                    position: 'absolute',
                    left: item.position.x,
                    top: item.position.y,
                    transform: `rotate(${item.rotation}deg)`,
                  }}>
                    {item.type === 'TV' && <div className="w-12 h-8 bg-black" />}
                    {item.type === 'Single Bed' && <div className="w-16 h-24 bg-blue-300" />}
                    {item.type === 'Double Bed' && <div className="w-24 h-24 bg-blue-400" />}
                    {item.type === 'Chair' && <div className="w-8 h-8 bg-green-300 rounded-full" />}
                    {item.type === 'Desk' && <div className="w-20 h-10 bg-yellow-600" />}
                    <button onClick={() => handleRotate(item.id)} className="absolute top-0 right-0 bg-gray-200 p-1 rounded">
                      <RotateCw size={12} />
                    </button>
                  </div>
                ))}
              </Room>
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {['TV', 'Single Bed', 'Double Bed', 'Chair', 'Desk'].map((item) => (
                  <DraggableItem key={item} type="furniture">
                    <button className="bg-red-200 px-4 py-2 rounded whitespace-nowrap">{item}</button>
                  </DraggableItem>
                ))}
              </div>
            </div>
          </DndProvider>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-8 font-serif">
      <h1 className="text-4xl text-center text-red-800 mb-8">FengShuiModern</h1>
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {renderStepContent()}
        
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button 
              onClick={handlePreviousStep}
              className="bg-gray-500 text-white px-6 py-3 rounded-full hover:bg-gray-600 transition duration-300"
            >
              <ArrowLeft className="inline-block mr-2" /> Back
            </button>
          )}
          {step < 3 ? (
            <button 
              onClick={handleNextStep}
              className="bg-yellow-500 text-white px-6 py-3 rounded-full hover:bg-yellow-600 transition duration-300 ml-auto"
            >
              Next <ArrowRight className="inline-block ml-2" />
            </button>
          ) : (
            <button 
              onClick={() => console.log('Analyze', items)}
              className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition duration-300 ml-auto"
            >
              ANALYZE
            </button>
          )}
        </div>
      </div>
      
      <div className="flex justify-center mt-8 space-x-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`w-4 h-4 rounded-full ${step >= i ? 'bg-red-600' : 'bg-gray-300'}`}></div>
        ))}
      </div>

      {showBusynessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h3>How busy is this {items.find(item => item.id === showBusynessPopup).type}?</h3>
            <div className="flex space-x-2 mt-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button key={rating} onClick={() => handleBusynessRate(showBusynessPopup, rating)}>
                  <Star className={rating <= items.find(item => item.id === showBusynessPopup).busyness ? "text-yellow-400" : "text-gray-300"} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FengShuiModern;
