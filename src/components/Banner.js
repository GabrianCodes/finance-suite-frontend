import { Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import UserContext from '../UserContext';
import '../App.css';

export default function Banner({ data }) {
	const { user } = useContext(UserContext);

	const { title, content, destination, label, destination2, label2 } = data;

	return (
		<div className="banner-container">
			<Row>
				<Col className="p-3 text-center">
					<h1 className="cursive-font">{title}</h1>
					<p>{content}</p>
					<div className="d-flex flex-column align-items-center"> {/* Flex column layout for vertical buttons */}
						<Link className="btn btn-primary mb-2 btn-responsive" to={destination}>
							{label}
						</Link>
						{user.id === null && (
							<Link className="btn btn-secondary mb-2 btn-responsive" to={destination2}>
								{label2}
							</Link>
						)}
					</div>
				</Col>
			</Row>
		</div>
	);
}