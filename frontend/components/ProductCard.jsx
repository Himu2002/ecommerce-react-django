function ProductCard({ product }) {
    return (
        <div className='bg-white p-4 rounded-xl shadow-md hover:shadow-lg shadow-gray-300 transition-shadow duration-300'>
            <img src={product.image}
                alt={product.name}
                className='w-full h-56 object-cover rounded-lg mb-4' />
            <h2 className='text-xl font-semibold text-gray-800 truncate'>{product.name}</h2>
            <p className='text-gray-600 font-medium'>${product.price}</p>
        </div>
    )
}

export default ProductCard;