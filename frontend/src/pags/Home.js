import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="HomePage">
            <h1>Home</h1>
            <Link to="./login">Login</Link>
        </div>
    )
}