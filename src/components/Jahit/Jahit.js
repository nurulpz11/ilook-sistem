import React, { useState } from 'react';
import './Jahit.css';

const Jahit = () => {
    const [cards, setCards] = useState([
        { id: 1, title: "SPK CMT", children: [] },
        { id: 2, title: "Proses CMT", children: [] },
        { id: 3, title: "Task 3", children: [] },
        { id: 4, title: "Task 4", children: [] },
    ]);

    const handleAddChild = (parentId) => {
        setCards((prevCards) =>
            prevCards.map((card) =>
                card.id === parentId
                    ? { ...card, children: [...card.children, { id: Date.now() }] }
                    : card
            )
        );
    };

    return (
        <div className="card-list">
            {cards.map((card) => (
                <div className="card" key={card.id}>
                    <h3>{card.title}</h3>
                    {card.children.map((child) => (
                        <div className="child-card" key={child.id}>
                            <p>Child Card </p>
                        </div>
                    ))}
                    <div
                        className="add-icon"
                        onClick={() => handleAddChild(card.id)}
                    >
                        +
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Jahit;
