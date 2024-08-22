import { Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import UserContext from '../UserContext'
import '../App.css'


export default function Banner({ data }) {
	const { user } = useContext(UserContext);

	const { title, content, destination, label, destination2, label2 } = data;

	return (
		<div className="banner-container">
			<Row>
				<Col className="p-3 text-center">
					<h1>{title}</h1>
					<p>{content}</p>
					<Link className="btn btn-primary me-2" to={destination} >{label}</Link>
					{(user.id === null)?
						<>
							<Link className="btn btn-secondary me-2" to={destination2}>{label2}</Link>
	                        
						</>
						:
						<></>
					}
				</Col>
			</Row>
			{(user.id === null) && (
                <Row>
                    <Col className="text-center">
                        <Link className="btn btn-success me-2 mb-3" to="/">Start</Link>
                    </Col>
                </Row>
            )}

		</div>

	)
}