import { Link } from 'react-router-dom';

const Home = () => {
	return (
		<>
			<div className="max-w-6xl mx-auto text-center flex-1 flex flex-col justify-center items-center">
				{/* Main heading */}
				<h1 className="text-orange-600/70 text-5xl md:text-7xl font-bold mb-4">
					Freight hai?
				</h1>
				<h2 className="text-orange-500/80 text-3xl md:text-4xl font-semibold mb-8">
					#HoJayega!
				</h2>

				<p className="text-blue-400/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
					Get instant quotes for your cargo shipping needs. Choose your preferred mode of transport and get competitive rates in minutes.
				</p>

				{/* Service selection cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
					{/* Air Freight Option */}
					<Link
						to="/quote?shippingType=AIR"
						className="group bg-white/50 backdrop-blur-md border-1 border-white/50 rounded-2xl p-8 hover:bg-white/90 hover:border-white/80 transition-all duration-300 transform hover:scale-105"
					>
						<div className="text-center">
							{/* Airplane Icon */}
							<div className="w-16 h-16 mx-auto mb-4 text-blue-500">
								<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
									<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
								</svg>
							</div>
							<h3 className="text-gray-400/70 text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
								Air Freight
							</h3>
							<p className="text-gray-400/70 text-sm font-semibold group-hover:text-blue-400 transition-colors">
								Fast & reliable air cargo shipping worldwide
							</p>
						</div>
					</Link>

					{/* Sea Freight Option */}
					<Link
						to="/quote?shippingType=WATER"
						className="group bg-white/50 backdrop-blur-md border-1 border-white/50 rounded-2xl p-8 hover:bg-white/90 hover:border-white/80 transition-all duration-300 transform hover:scale-105"
					>
						<div className="text-center">
							{/* Ship Icon */}
							<div className="w-16 h-16 mx-auto mb-4 text-blue-500">
								<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
									<path d="M19 18H5a1 1 0 0 1-1-1v-1h16v1a1 1 0 0 1-1 1M3 14v1a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-1H3m2-1h14l-1-6H6l-1 6m2.5-7h9l.5 1H7.5l.5-1M12 2L9 5h6l-3-3Z" />
								</svg>
							</div>
							<h3 className="text-gray-400 text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
								Sea Freight
							</h3>
							<p className="text-gray-400/70 text-sm group-hover:text-blue-400 transition-colors">
								Cost-effective ocean shipping for large cargo
							</p>
						</div>
					</Link>
				</div>

				{/* CTA Button */}
				<Link
					to="/quote"
					className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
				>
					Get an Estimate
					<span className="ml-2 text-sm opacity-80">(takes ~ 1 min)</span>
					<svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
					</svg>
				</Link>
			</div>
			{/* Services overview */}
			{/* <section className="px-6 py-12 border-white/10">
				<div className="max-w-7xl mx-auto">
					<h3 className="text-blue-500/80 text-center text-lg font-medium mb-8">Our services</h3>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{[
							{ name: 'Air Freight Express', color: 'from-blue-200 to-blue-300' },
							{ name: 'Sea Freight FCL/LCL', color: 'from-blue-300 to-indigo-200' },
							{ name: 'Door to Door', color: 'from-indigo-200 to-blue-200' },
							{ name: 'Customs Clearance', color: 'from-blue-200 to-blue-300' }
						].map((service, index) => (
							<div
								key={index}
								className={`bg-gradient-to-br ${service.color} rounded-lg px-4 py-6 text-center text-white font-medium text-sm hover:scale-105 transition-transform cursor-pointer shadow-sm hover:shadow-md`}
							>
								{service.name}
							</div>
						))}
					</div>
				</div>
			</section> */}
		</>
	);
};

export default Home;